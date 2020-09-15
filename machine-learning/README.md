# Firebase Admin SDK Node.js ML quickstart

This sample script shows how you can use the Firebase Admin SDK to manage your
Firebase-hosted ML models.

See the [developer guide][docs] for more information on model management.

[docs]: https://firebase.google.com/docs/ml-kit/manage-hosted-models

## Setup

1.  Clone the quickstart repository and install the ML quickstart's
    dependencies:

    ```
    $ git clone https://github.com/firebase/quickstart-nodejs.git
    $ cd quickstart-nodejs/machine-learning
    $ npm install
    $ chmod u+x manage-ml.js  # Optional
    ```

2.  If you don't already have a Firebase project, create a new project in the
    [Firebase console](https://console.firebase.google.com/). Then, open your
    project in the Firebase console and do the following:

    1.  On the [Settings][service-account] page, create a service account and
        download the service account key file. Keep this file safe, since it
        grants administrator access to your project.
    2.  On the Storage page, enable Cloud Storage. Take note of your default
        bucket name (or create a new bucket for ML models.)
    3.  On the ML Kit page, click **Get started** if you haven't yet enabled ML
        Kit.

3.  In the [Google APIs console][enable-api], open your Firebase project and
    enable the Firebase ML API.

[enable-api]: https://console.developers.google.com/apis/library/firebaseml.googleapis.com?project=_

4.  At the top of `manage-ml.js`, set the `SERVICE_ACCOUNT_KEY` and
    `STORAGE_BUCKET`:

    ```
    const SERVICE_ACCOUNT_KEY = '/path/to/your/service_account_key.json';
    const STORAGE_BUCKET = 'your-storage-bucket';
    ```

[service-account]: https://firebase.google.com/project/_/settings/serviceaccounts/adminsdk

## Example session

```
$ ./manage-ml.js list
fish_detector    8716935   vision
barcode_scanner  8716959   vision
$ ./manage-ml.js new yak_detector -f ~/yak.tflite --tags vision,experimental
Uploading model to Cloud Storage...
Model uploaded and published:
yak_detector     8717019   experimental, vision
$ ./manage-ml.js new emu_detector -a projects/12345/locations/us-central1/models/ICN12345
Model uploaded and published:
emu_detector     8717033
$ ./manage-ml.js update 8717019 --remove_tags experimental
$ ./manage-ml.js delete 8716959
$ ./manage-ml.js list
fish_detector    8716935   vision
yak_detector     8717019   vision
emu_detector     8717033
$
```
