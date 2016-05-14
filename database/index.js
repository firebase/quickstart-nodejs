/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// [START imports]
var firebase = require('firebase');
// [END imports]

// [START initialize]
// Initialize the app with a service account, granting admin privileges
firebase.initializeApp({
  // TODO(DEVELOPER): Change the 2 placeholder below.
  databaseURL: 'https://<PROJECT_ID>.firebaseio.com',
  serviceAccount: '<SERVICE_ACCOUNT_CRENDENTIAL_FILE.json>'
});
// [END initialize]


// [START function]
// Makes all new messages ALL UPPERCASE.
// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = firebase.database();
var messageRef = db.ref('/messages');
messageRef.on('child_added', function(snapshot) {
  console.log('New message:', snapshot.val().text);

  // Uppercase the message.
  var uppercased = snapshot.val().text.toUpperCase();

  // Saving the uppercased message to DB.
  console.log('Saving uppercased message: ' + uppercased);
  return snapshot.ref.update({text: uppercased});
});
console.log('Uppercaser started...');
// [END function]
