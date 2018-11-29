var rp = require('request-promise');
var fs = require('fs');
var google = require('googleapis');

var PROJECT_ID = 'PROJECT_ID';
var HOST = 'https://firebaseremoteconfig.googleapis.com';
var PATH = '/v1/projects/' + PROJECT_ID + '/remoteConfig';
var SCOPES = ['https://www.googleapis.com/auth/firebase.remoteconfig'];

/**
 * Get a valid access token.
 */
// [START retrieve_access_token]
function getAccessToken() {
  return new Promise(function(resolve, reject) {
    var key = require('./service-account.json');
    var jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    );
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
}
// [END retrieve_access_token]

/**
 * Retrieve the current Firebase Remote Config template from the server. Once
 * retrieved the template is stored locally in a file named `config.json`.
 */
function getTemplate() {
  getAccessToken().then(function(accessToken) {
    var options = {
      uri: HOST + PATH,
      method: 'GET',
      gzip: true,
      resolveWithFullResponse: true,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Accept-Encoding': 'gzip',
      }
    };

    rp(options)
        .then(function(resp) {
          fs.writeFileSync('config.json', resp.body);
          console.log('Retrieved template has been written to file config.json');
          console.log('ETag from server: ' + resp.headers['etag']);
        })
        .catch(function(err) {
          console.error('Unable to get template');
          console.error(err);
        });
  });
}

/**
 * Print the last 5 available Firebase Remote Config template metadata from the server.
 */
function listVersions() {
  getAccessToken().then(function(accessToken) {
    const options = {
      uri: HOST + PATH + ':listVersions?pageSize=5',
      method: 'GET',
      resolveWithFullResponse: true,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
    };

    rp(options)
        .then(function(resp) {
          console.log('Versions:');
          console.log(resp.body);
        })
        .catch(function(err) {
          console.error('Unable to list versions');
          console.error(err);
        });
  });
}

/**
 * Roll back to an available version of Firebase Remote Config template.
 *
 * @param version Version of the template to roll back to.
 */
function rollback(version) {
  getAccessToken().then(function(accessToken) {
    const options = {
      uri: HOST + PATH + ':rollback',
      method: 'POST',
      gzip: true,
      json: true,
      resolveWithFullResponse: true,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json; UTF-8',
        'Accept-Encoding': 'gzip',
      },
      body: {
        version_number: version
      }
    };

    rp(options)
        .then(function(resp) {
          console.log('Rolled back to: ' + version);
          console.log(resp.body);
          const newETag = resp.headers['etag'];
          console.log('ETag from server: ' + newETag);
        })
        .catch(function(err) {
          console.error('Request to roll back to template: ' + version + ' failed.');
          console.error(err);
        });
  });
}

/**
 * Publish the local template stored in `config.json` to the server.
 *
 * @param {String} etag ETag must be supplied when publishing a template. This is to
 *                      avoid race conditions when publishing.
 */
function publishTemplate(etag) {
  getAccessToken().then(function(accessToken) {
    var options = {
      method: 'PUT',
      uri: HOST + PATH,
      body: fs.readFileSync('config.json', 'UTF8'),
      gzip: true,
      resolveWithFullResponse: true,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json; UTF-8',
        'If-Match': etag
      }
    };
    rp(options)
        .then(function(resp) {
          var newETag = resp.headers['etag'];
          console.log('Template has been published');
          console.log('ETag from server: ' + newETag);
        })
        .catch(function(err) {
          console.error('Unable to publish template.');
          console.error(err);
        });
  });
}

const action = process.argv[2];
const etagOrVersion = process.argv[3];

if (action && action === 'get') {
  getTemplate();
} else if (action && action === 'publish' && etagOrVersion) {
  publishTemplate(etagOrVersion);
} else if (action && action === 'versions') {
  listVersions();
} else if (action && action === 'rollback' && etagOrVersion) {
  rollback(etagOrVersion);
} else {
  console.log('Invalid command. Please use one of the following:\n'
      + 'node index.js get\n'
      + 'node index.js publish <LATEST_ETAG>\n'
      + 'node index.js versions\n'
      + 'node index.js rollback <TEMPLATE_VERSION_NUMBER>');
}
