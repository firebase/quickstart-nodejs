Firebase Remote Config REST API Node.js Quickstart
===============================================

The [Firebase Remote Config](https://firebase.google.com/docs/remote-config/) Node.js quickstart app 
demonstrates retrieving and updating the Firebase Remote Config template.

Introduction
------------

This is a simple example of using the Firebase Remote Config REST API to update
the Remote Config template being used by clients apps.

Getting started
---------------

1. [Add Firebase to your Android Project](https://firebase.google.com/docs/android/setup).
2. Create a service account as described in [Adding Firebase to your Server](https://firebase.google.com/docs/admin/setup) and download the JSON file.
  - Copy the private key JSON file to this folder and rename it to `service-account.json`.
3. Change the `PROJECT_ID` variable in `index.js` to your project ID.

Run
---

- Get active template
  - From the `config` directory run `node index.js get` to retrieve the template.
    - The returned template is stored in a file named `config.json`.
    - Note the ETag printed to the console you will need to use it when publishing template updates.
- Update the template
  - If your template already has parameters, adjust one or more of the values.
  - If your template is empty, update it to look like this:

        {
          "conditions": [
            {
              "name": "AndroidUsers",
              "expression": "device.os == 'android'",
              "tagColor": "PURPLE"
            },
            {
              "name": "iOSUsers",
              "expression": "device.os == 'ios'",
              "tagColor": "GREEN"
            }
          ],
          "parameters": {
            "welcome_message": {
              "defaultValue": {
                "value": "Welcome"
              },
              "conditionalValues": {
                "AndroidUsers": {
                  "value": "Welcome Android User"
                },
                "iOSUsers": {
                  "value": "Welcome iOS User"
                }
              }
            }
          }
        }

  - From the `config` directory run `node index.js publish <LATEST_ETAG>` to update the template.
    - Be sure to set the etag to the one that was last printed in the console.
  - Confirm in the console that the template has been updated.
    - At this point mobile clients can fetch the updated values.
- View existing versions
  - From the `config` directory run `node index.js versions` to print the metadata of the
    last 5 template versions.
- Roll back to an existing template
  - From the `config` directory run `node index.js rollback <TEMPLATE_VERSION_NUMBER>` to
    activate the template with the matching version number.

Best practices
--------------

This section provides some additional information about how the Remote Config
REST API should be used when retrieving and updating templates.

### [Versions](https://firebase.google.com/docs/remote-config/templates) ###

Each time you update parameters, {{remote_config}} creates a
new versioned {{remote_config}} template and stores the previous template as
a version that you can retrieve or roll back to as needed.

All non-active versions expire and are removed if they are older than 90 days or if
there are more than 300 newer template versions. Since template versions expire, any
versions that need to be retrieved later on should be persisted externally.

Use the `listVersions` [query parameters](https://firebase.google.com/docs/reference/remote-config/rest/v1/projects.remoteConfig/listVersions#query-parameters)
to filter the versions that are returned.

### ETags ###

Each time the Remote Config template it retrieved an ETag is included. This ETag is a
unique identifier of the current template on the server. When submitting updates
to the template you must include the latest ETag to ensure that your updates are consistent.

In the event that you want to completely overwrite the server's template use
an ETag of "\*". Use this with caution since this operation cannot be undone.

**NOTE:** To get the ETag your request must accept the gzip encoding. Add the header
`Accept-Encoding: gzip` to receive the ETag in the response header `ETag`.

Support
-------

- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase-remote-config)
- [Firebase Support](https://firebase.google.com/support/)
