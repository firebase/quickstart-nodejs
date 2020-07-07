Firebase Cloud Messaging Node.js Quickstart
===========================================

The Firebase Cloud Messaging Node.js quickstart app demonstrates sending
notification messages to a topic. All clients subscribed to the topic
will receive the message.

Introduction
------------

This is a simple example of using Firebase Cloud Messaging REST API to send
the same message to different platforms. To learn more about how you can use
Firebase Cloud Messaging REST API in your app, see [About Cloud Messaging Server](https://firebase.google.com/docs/cloud-messaging/server/).

Getting started
---------------

1. Create a service account as described in [Adding Firebase to your Server](https://firebase.google.com/docs/admin/setup) and download the JSON file.
  - Copy the json file to this folder and rename it to `service-account.json`. Change the code to point to your
    file rather than the one in `placeholders`.
2. Change the `PROJECT_ID` variable in `index.js` to your project ID.
3. Ensure that you have [`googleapis`](https://github.com/google/google-api-nodejs-client) installed.

        npm install googleapis

Run
---
- This sample allows you to send two types of messages:

  1. A message that uses the common `notification` object of the API. It is used to define
  the `title` and `body` of a notification message (display message). To send this message, from the
  `messaging` directory run:

         node index.js common-message

  2. A message that uses the common `notification` object of the API as well as tha `android` and
  `apns` objects to customize the messages received on the corresponding platforms. To send this
  message, from the `messaging` directory run:

         node index.js override-message

- Any client devices that you have subscribed to the news topic should receive
  a notification message.

  1. When you use the `common-message` option, clients receive a simple notification message
  with only title and body defined.

  2. When you use the `override-message` option, clients receive a simple notification message
  with title and body defined. In addition:
    - iOS devices would receive high priority messages and if the app is in the background then a
    badge will be applied to the app's icon.

    - Android devices would receive a message with a `click_action`. In this case it is set
    to the default intent, but this could be customized to any intent available in your app.

Best practices
--------------
This section provides some additional information about how the FCM payloads can
be used to target different platforms.

### Common payloads ###

In many cases you may want to send the same message to multiple platforms. If
this is a notification message (display notification) then you can use the
common payloads. These are payloads that are automatically translated to their
platform equivalent payloads.

### Platform customizations ###

In cases where you would like to customize the message for the different platforms
that will receive the message, use the platform specific objects to add or override
anything set by the common fields.

For example, if you want to send a notification message (display notification) to all platforms
but you would like to include accompanying data to Android clients receiving the
message, then you can use the `android` object to define a `data` payload that will
be appended to the notification message when sent to Android clients.

Support
-------

- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase-cloud-messaging)
- [Firebase Support](https://firebase.google.com/support/)

License
-------

Copyright 2016 Google, Inc.

Licensed to the Apache Software Foundation (ASF) under one or more contributor
license agreements.  See the NOTICE file distributed with this work for
additional information regarding copyright ownership.  The ASF licenses this
file to you under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License.  You may obtain a copy of
the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
License for the specific language governing permissions and limitations under
the License.
