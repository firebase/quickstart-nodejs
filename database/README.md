Firebase Node.js Realtime Database Quickstart
==========================================

The Node.js Firebase Database quickstart demonstrates how to connect to and use the Firebase Realtime Database using Node.js through a simple social blogging app. It will interoperate with the Web, iOS and Android database quickstarts.

This server will:
 - Update the star counts for all posts.
 - Send email notifications when a post has been starred.
 - Send weekly emails listing top post.

Introduction
------------

- [Read more about Firebase Database](https://firebase.google.com/docs/database/)

Getting Started
---------------

- Create your project on the [Firebase Console](https://console.firebase.google.com).
- Create a service account as described in [Adding Firebase to your Server](https://firebase.google.com/docs/server/setup) and drop the file in this directory. Or use the provided test service account.
- Change the `<PROJECT_ID>` and `<PATH_TO_SERVICE_ACCOUNT_CREDENTIAL_FILE>` placeholders in [`index.js`](index.js).
- Configure your email transport in [`index.js`](index.js).
- Run `npm install`.
- Run `node index.js` to run the Node.js app locally.
- Configure and run one of the Database quickstarts for [Web](https://github.com/firebase/quickstart-js/tree/master/database), [iOS](https://github.com/firebase/quickstart-ios/tree/master/database) or [Android](https://github.com/firebase/quickstart-android/tree/master/database). Then use one of these apps to publish new posts: you should receive email notifications when one of your posts have received a new star and the starred counter should be kept up to date by the app.

Support
-------

https://firebase.google.com/support/

License
-------

© Google, 2016. Licensed under an [Apache-2](../LICENSE) license.
