const fs = require('fs');
const admin = require('firebase-admin');
admin.initializeApp();

/**
 * Get a valid access token.
 */
// [START retrieve_access_token]
function getAccessToken() {
  return admin.credential.applicationDefault().getAccessToken()
      .then(accessToken => {
        return accessToken.access_token;
      })
      .catch(err => {
        console.error('Unable to get access token');
        console.error(err);
      });
}
// [END retrieve_access_token]

/**
 * Retrieve the current Firebase Remote Config template from the server. Once
 * retrieved the template is stored locally in a file named `config.json`.
 */
// [START retrieve_template]
function getTemplate() {
  const config = admin.remoteConfig();
  config.getTemplate()
      .then(template => {
        console.log('ETag from server: ' + template.etag);
        const templateStr = JSON.stringify(template);
        fs.writeFileSync('config.json', templateStr);
      })
      .catch(err => {
        console.error('Unable to get template');
        console.error(err);
      });
}
// [END retrieve_template]

/**
 * Publish the local template stored in `config.json` to the server.
 */
// [START publish_template]
function publishTemplate() {
  const config = admin.remoteConfig();
  const template = config.createTemplateFromJSON(
      fs.readFileSync('config.json', 'UTF8'));
  config.publishTemplate(template)
      .then(updatedTemplate => {
        console.log('Template has been published');
        console.log('ETag from server: ' + updatedTemplate.etag);
      })
      .catch(err => {
        console.error('Unable to publish template.');
        console.error(err);
      });
}
// [END publish_template]

// [START update_template]
async function getAndUpdateTemplate() {
  const config = admin.remoteConfig();
  try {
    // Get current active template.
    const template = await config.getTemplate();
    // Set "android_en" condition.
    template.conditions.push({
      name: 'android_en',
      expression: 'device.os == \'android\' && device.country in [\'us\', \'uk\']',
      tagColor: 'BLUE',
    });
    // Set "header_text" parameter.
    template.parameters['header_text'] = {
      defaultValue: {
        value: 'A Gryffindor must be brave, talented and helpful.'
      },
      conditionalValues: {
        android_en: {
          value: 'A Droid must be brave, talented and helpful.'
        },
      },
    };
    // Validate template after updating it.
    await config.validateTemplate(template);
    // Publish updated template.
    const updatedTemplate= await config.publishTemplate(template);
    console.log('Latest etag: ' + updatedTemplate.etag);
  } catch (err) {
    console.error('Unable to get and update template.');
    console.error(err);
  }
}
// [END update_template]

const action = process.argv[2];

if (action && action === 'get') {
  getTemplate();
} else if (action && action === 'publish') {
  publishTemplate();
} else if (action && action === 'update') {
  getAndUpdateTemplate();
} else {
  console.log(
`
Invalid command. Please use one of the following:
node index.js get
node index.js publish
node index.js update
`
  );
}
