#!/usr/bin/env node
/*
 * Copyright 2020 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

const admin = require("firebase-admin");

// TODO(user): Configure for your project. (See README.md.)
const SERVICE_ACCOUNT_KEY = '/path/to/your/service_account_key.json';
const STORAGE_BUCKET = 'your-storage-bucket';

// Initialize the Firebase Admin SDK.
const serviceAccount = require(SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: STORAGE_BUCKET,
});
const storageBucket = admin.storage().bucket();
const ml = admin.machineLearning();

/**
 * Upload a TensorFlow Lite model to your project and publish it.
 *
 * @param {string} tflite Path to the tflite file you want to upload.
 * @param {string} displayName A name to identify the model in your Firebase
 *  project. This is the name you use from your app to load the model.
 * @param {?Array<string>=} tags Optional tags to help with model management.
 */
const uploadModel = async (tflite, displayName, tags = null) => {
  console.log('Uploading model to Cloud Storage...');
  const files = await storageBucket.upload(tflite);
  const bucket = files[0].metadata.bucket;
  const name = files[0].metadata.name;
  const gcsUri = `gs://${bucket}/${name}`;

  const modelSpec = {
    displayName: displayName,
    tfliteModel: { gcsTfliteUri: gcsUri },
  };
  if (tags != null) { modelSpec.tags = tags; }
  const model = await ml.createModel(modelSpec);

  await ml.publishModel(model.modelId);

  const tagList = model.tags == null ? '' : model.tags.join(", ");
  console.log('Model uploaded and published:');
  console.log(`${model.displayName}\t\t${model.modelId}\t ${tagList}`);
};

/**
 * Add an AutoML TensorFlow Lite model to your project and publish it.
 *
 * @param {string} automlRef AutoML reference of the model you want to add.
 *  (e.g. 'projects/12345678/locations/us-central1/models/ICN1234567890')
 * @param {string} displayName A name to identify the model in your Firebase
 *  project. This is the name you use from your app to load the model.
 * @param {?Array<string>=} tags Optional tags to help with model management.
 */
const addAutoMLModel = async (automlRef, displayName, tags = null) => {
  const modelSpec = {
    displayName: displayName,
    tfliteModel: { automlModel: automlRef },
  };
  if (tags != null) { modelSpec.tags = tags; }
  const model = await ml.createModel(modelSpec);
  await model.waitForUnlocked();

  await ml.publishModel(model.modelId);

  const tagList = model.tags == null ? '' : model.tags.join(", ");
  console.log('Model uploaded and published:');
  console.log(`${model.displayName}\t\t${model.modelId}\t ${tagList}`);
};

/**
 * List the models in your project.
 *
 * @param {string=} filter An optional filter string to limit your results. See
 *  https://firebase.google.com/docs/ml-kit/manage-hosted-models#list_your_projects_models
 */
const listModels = async (filter = null) => {
  let listOptions = filter == null ? {} : { filter: filter };
  let models;
  // `listModels()` returns a page token if there are additional pages of
  // results that weren't returned by the request. We'll keep making requests
  // with the tokens until we've printed everything.
  let pageToken = null;
  do {
    if (pageToken) listOptions.pageToken = pageToken;
    ({models, pageToken} = await ml.listModels(listOptions));
    for (const model of models) {
      const tags = model.tags == null ? '' : model.tags.join(", ");
      console.log(`${model.displayName}\t\t${model.modelId}\t ${tags}`);
    }
  } while (pageToken != null);
};

/**
 * Update a model in your project.
 *
 * @param {string} modelId The ID of the model you want to update.
 * @param {string=} tflite The path to a tflite file that will replace the
 *  current one.
 * @param {string=} displayName A new name for the model.
 * @param {?Array<string>=} newTags Tags to add to the model.
 * @param {?Array<string>=} removeTags Tags to remove from the model.
 */
const updateModel = async (modelId, tflite = null, displayName = null, newTags = null, removeTags = null) => {
  const model = await ml.getModel(modelId);

  // Any fields you don't specify will remain unchanged in the project. So,
  // create a request that only includes the non-null parameters.
  const updates = {};

  if (tflite != null) {
    // Upload a new tflite file to Cloud Storage.
    const files = await storageBucket.upload(tflite);
    const bucket = files[0].metadata.bucket;
    const name = files[0].metadata.name;
    updates.tfliteModel = { gcsTfliteUri: `gs://${bucket}/${name}` };
  }

  if (displayName != null) {
    updates.displayName = displayName;
  }

  if (newTags != null) {
    updates.tags = model.tags.concat(newTags);
  }

  if (removeTags != null) {
    if (!updates.tags) {
      updates.tags = model.tags;
    }
    updates.tags = updates.tags.filter(tag => !removeTags.includes(tag));
  }

  // Update the model.
  await ml.updateModel(model.modelId, updates);
};


/**
 * Delete a model from your project.
 *
 * @param {string} modelId The ID of the model you want to delete.
 */
const deleteModel = async (modelId) => {
  await ml.deleteModel(modelId);
};

// The rest of the file just parses the command line and dispatches one of the
// functions above.

require('yargs')
    .scriptName("manage-ml")
    .usage('$0 <cmd> [args]')
    .command('new <name> [-f <model_file>] [-a <automl_ref>] [-t tags]]',
             'Upload and publish a tflite model',
             (yargs) => {
               yargs.positional('name', {
                 describe: 'Display name for the model',
                 type: 'string'
               });
               yargs.option('file', {
                 alias: 'f',
                 demandOption: false,
                 describe: 'Path to a tflite model',
                 type: 'string',
                 conflicts: 'automl'
               });
               yargs.option('automl', {
                 alias: 'a',
                 demandOption: false,
                 describe: 'AutoML model reference (e.g. projects/12345678/' +
                           'locations/us-central1/models/ICN1234567890)',
                 type: 'string',
                 conflicts: 'file'
               });
               yargs.option('tags', {
                 alias: 't',
                 demandOption: false,
                 default: null,
                 describe: 'Comma-separated list of tags (optional)',
                 type: 'string'
               });
             }, (argv) => {
               (async () => {
                 const tags = argv.tags == null ? null : argv.tags.split(',');
                 if (argv.file) {
                   await uploadModel(argv.file, argv.name, tags);
                 } else if (argv.automl) {
                   await addAutoMLModel(argv.automl, argv.name, tags);
                 } else {
                   console.error('One of --file or --automl must be specified.');
                   process.exit(1);
                 }
                 process.exit();
               })().catch(e => {
                 printError(e);
                 process.exit(1);
               });
             })
    .command('list [-f filter-exp]',
             'List the models in your project.\n\nFor information about the '
             + 'filter language, see\n'
             + 'https://firebase.google.com/docs/ml-kit/manage-hosted-models#list_your_projects_models',
             (yargs) => {
               yargs.option('filter', {
                 alias: 'f',
                 demandOption: false,
                 default: null,
                 describe: 'Filter expression (optional)',
                 type: 'string'
               });
             }, (argv) => {
               (async () => {
                 await listModels(argv.filter);
                 process.exit();
               })().catch(e => {
                 printError(e);
                 process.exit(1);
               });
             })
    .command('update <model_id> [-m model_file] [-n name] [-t new_tags] [-d remove_tags]',
             "Update one of your project's models",
             (yargs) => {
               yargs.positional('model_id', {
                 describe: 'The ID of the model you want to update',
                 type: 'number'
               });
               yargs.option('model_file', {
                 alias: 'm',
                 demandOption: false,
                 default: null,
                 describe: "Path to a new tflite file (optional)",
                 type: 'string'
               });
               yargs.option('name', {
                 alias: 'n',
                 demandOption: false,
                 default: null,
                 describe: "New display name (optional)",
                 type: 'string'
               });
               yargs.option('new_tags', {
                 alias: 't',
                 demandOption: false,
                 default: null,
                 describe: 'Comma-separated list of tags to add (optional)',
                 type: 'string'
               });
               yargs.option('remove_tags', {
                 alias: 'd',
                 demandOption: false,
                 default: null,
                 describe: 'Comma-separated list of tags to remove (optional)',
                 type: 'string'
               });
             }, (argv) => {
               (async () => {
                 const newTags = argv.new_tags == null ? null : argv.new_tags.split(',');
                 const removeTags = argv.remove_tags == null ? null : argv.remove_tags.split(',');
                 await updateModel(argv.model_id.toString(), argv.model_file, argv.name, newTags, removeTags);
                 process.exit();
               })().catch(e => {
                 printError(e);
                 process.exit(1);
               });
             })
    .command('delete <model_id>',
             "Delete a model from your project",
             (yargs) => {
               yargs.positional('model_id', {
                 describe: 'The ID of the model you want to delete',
                 type: 'number'
               });
             }, (argv) => {
               (async () => {
                 await deleteModel(argv.model_id.toString());
                 process.exit();
               })().catch(e => {
                 printError(e);
                 process.exit(1);
               });
             })
    .check((argv) => {
      if ('model_id' in argv) {
        if (!Number.isInteger(argv.model_id)) {
          throw Error(`ERROR: Specify the model's numerical ID.`);
        }
      }
      return true;
    })
    .demandCommand()
    .help()
    .parse();

const printError = (e) => {
  if ('errorInfo' in e) {
    console.error(`ERROR: ${e.errorInfo.message}`);
  }
};
