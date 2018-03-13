Firebase Remote Config REST API Node.js Quickstart
===============================================

The Firebase Remote Config Node.js quickstart app demonstrates retrieving and
updating the Firebase Remote Config template.

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

- Clone or download the sample from the [quickstart-node.js](https://github.com/firebase/quickstart-nodejs) repository.
- From the `config` directory run `node index.js get` to retrieve the template.
  - The returned template is stored in a file named `config.json`.
  - Note the Etag printed to the console you will need to use it when publishing template updates.
- Update the template.
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

Best practices
--------------

This section provides some additional information about how the Remote Config
REST API should be used when retrieving and updating templates.

### Etags ###

Eath time the Remote Config template is retrieved an Etag is included. This Etag is a
unique identifier of the current template on the server. When submitting updates
to the template you must include the latest Etag to ensure that your updates are consistent.

In the event that you want to completely overwrite the server's template use
an Etag of "\*". Use this with caution since this operation cannot be undone.

Support
-------

- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase-cloud-messaging)
- [Firebase Support](https://firebase.google.com/support/)
