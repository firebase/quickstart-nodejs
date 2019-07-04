var https = require('https');
var zlib = require('zlib');
var fs = require('fs');
var google = require('googleapis');

var PROJECT_ID = 'PROJECT_ID';
var HOST = 'firebaseremoteconfig.googleapis.com';
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
      hostname: HOST,
      path: PATH,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Accept-Encoding': 'gzip',
      }
    };

    var buffer = [];
    var request = https.request(options, function(resp) {
      if (resp.statusCode == 200) {
        var gunzip = zlib.createGunzip();
        resp.pipe(gunzip);

        gunzip.on('data', function(data) {
          buffer.push(data.toString());
        }).on('end', function() {
          fs.writeFileSync('config.json', buffer.join(''));
          console.log('Retrieved template has been written to config.json');
          var etag = resp.headers['etag'];
          console.log('ETag from server: ' + etag);
        }).on('error', function(err) {
          console.error('Unable to decompress template.');
          console.error(err);
        });
      } else {
        console.log('Unable to get template.');
        console.log(resp.error);
      }
    });

    request.on('error', function(err) {
      console.log('Request for configuration template failed.');
      console.log(err);
    });

    request.end();
  });
}

/**
 * Print the last 5 available Firebase Remote Config template metadata from the server.
 */
function listVersions() {
  getAccessToken().then(function(accessToken) {
    const options = {
      hostname: HOST,
      path: PATH + ':listVersions?pageSize=5',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
    };

    const request = https.request(options, function(resp) {
      if (resp.statusCode === 200) {
        console.log('Versions:');
        resp.on('data', function(data) {
          console.log(data.toString());
        });
      } else {
        resp.on('data', function(err) {
          console.log(err.toString());
        });
      }
    });

    request.on('error', function(err) {
      console.error('Request for template versions failed.');
      console.error(err.toString());
    });

    request.end();
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
      hostname: HOST,
      path: PATH + ':rollback',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json; UTF-8',
        'Accept-Encoding': 'gzip',
      }
    };
    const request = https.request(options, function(resp) {
      const gunzip = zlib.createGunzip();
      resp.pipe(gunzip);

      if (resp.statusCode === 200) {
        gunzip.on('data', function(data) {
          console.log('Rolled back to: ' + version);
          console.log(data.toString());
          const newETag = resp.headers['etag'];
          console.log('ETag from server: ' + newETag);
        });
      } else {
        gunzip.on('data', function(data) {
          console.error(data.toString());
        });
      }
    });

    const rollbackVersion = {
      version_number: version
    };

    request.write(JSON.stringify(rollbackVersion));

    request.on('error', function(err) {
      console.error('Request to roll back to template: ' + version + ' failed.');
      console.error(err.toString());
    });

    request.end();
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
      hostname: HOST,
      path: PATH,
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json; UTF-8',
        'Accept-Encoding': 'gzip',
        'If-Match': etag
      }
    };

    var request = https.request(options, function(resp) {
      if (resp.statusCode === 200) {
        var newETag = resp.headers['etag'];
        console.log('Template has been published');
        console.log('ETag from server: ' + newETag);
      } else {
        console.log('Unable to publish template.');
        console.log(resp.error);
      }
    });

    request.on('error', function(err) {
      console.log('Request to send configuration template failed.');
      console.log(err);
    });

    request.write(fs.readFileSync('config.json', 'UTF8'));
    request.end();
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
