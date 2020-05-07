Firebase Remote Config REST API Node.js Quickstart
===============================================

The [Firebase Remote Config](https://firebase.google.com/docs/remote-config/) Node.js quickstart app 
demonstrates retrieving and updating the Firebase Remote Config template.

Introduction
------------

This is a simple example of using the Firebase Admin SDK to update
the Remote Config template being used by clients apps. You can also directly
use the [Remote Config REST API](https://firebase.google.com/docs/remote-config/automate-rc#modify_remote_config_using_the_rest_api)
to perform additional template operations. 

Getting started
---------------

1. [Create a Firebase project](https://console.firebase.google.com).
2. Create a service account as described in [Adding Firebase to your Server](https://firebase.google.com/docs/admin/setup)
   and download the JSON file.
3. Set the [`GOOGLE_APPLICATION_CREDENTIALS`](https://firebase.google.com/docs/admin/setup#initialize-sdk)
   environment variable to the path of the JSON file.

Run
---

- Get active template
  - From the `config` directory run `node index.js get` to retrieve the template.
    - The returned template is stored in a file named `config.json`.
    - Note the ETag printed to the console. When replacing the current template
      a matching ETag ensures that no template versions are overwritten
      accidentally.
- Update the template via file
  - If your template already has parameters, adjust one or more of the values.
  - If your template is empty, update parameters and conditions to look like
    this:

        {
          "etag": "etag-<YOUR_TEMPLATE_ETAG>",
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

  - From the `config` directory run `node index.js publish` to update the template.
  - Confirm in the console that the template has been updated.
    - At this point mobile clients can fetch the updated values.
- Update the template in memory
  - From the `config` directory run `node index.js update` to retrieve the
    current template and update it in memory. Using this option will set the
    a condition (`android_en`) and a parameter that uses the condition.

Best practices
--------------

This section provides some additional information about how the Remote Config
Admin SDK should be used when retrieving and updating templates.

### ETags ###

Each time the Remote Config template it retrieved an ETag is included. This ETag is a
unique identifier of the current template on the server. When submitting updates
to the template you must include the latest ETag to ensure that your updates are consistent.

In the event that you want to completely overwrite the server's template set
the `force` parameter of `publishTemplate` method to `true`. Use this with
caution since this operation cannot be undone.

Support
-------

- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase-remote-config)
- [Firebase Support](https://firebase.google.com/support/)
