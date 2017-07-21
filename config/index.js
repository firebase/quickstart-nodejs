const https = require('https');
var fs = require('fs');
var google = require('googleapis');

var PROJECT_ID = '<YOUR_PROJECT_ID>';
var HOST = 'firebaseremoteconfig.googleapis.com';
var PATH = '/v1/projects/' + PROJECT_ID + '/remoteConfig';
var SCOPE = 'https://www.googleapis.com/auth/firebase.remoteconfig';

/**
 * Get a valid access token.
 */
function getAccessToken() {
  return new Promise(function(resolve, reject) {
    var key = require('./service-account.json');
    var jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      [SCOPE],
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
        'Authorization': 'Bearer ' + accessToken
      }
    }

    var request = https.request(options, function(resp) {
      resp.setEncoding('utf8');
      var etag = resp.headers['etag'];
      resp.on('data', function(data) {
        fs.writeFileSync('config.json', data);
        console.log('Retrieved template has been written to config.json');
        console.log('ETag from server: ' + etag);
      });
    });

    request.on('error', function(err) {
      console.log('Unable to get template.');
      console.log(err);
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
        'If-Match': etag
      }
    }

    var request = https.request(options, function(resp) {
      resp.setEncoding('utf8');
      var newEtag = resp.headers['x-google-api-etag'];
      console.log('Template has been published');
      console.log('ETag from server: ' + newEtag);
    });

    request.on('error', function(err) {
      console.log('Unable to publish template.');
      console.log(err);
    });

    request.write(fs.readFileSync('config.json', 'UTF8'));
    request.end();
  });
}

var action = process.argv[2];
var etag = process.argv[3];

if (action && action == 'get') {
  getTemplate();
} else if (action && action == 'publish' && etag) {
  publishTemplate(etag);
} else {
  console.log('Invalid command. Please use one of the following:\n'
      + 'node index.js get\n'
      + 'node index.js publish <LATEST_ETAG>');
}
