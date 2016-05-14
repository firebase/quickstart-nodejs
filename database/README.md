Firebase Node Realtime Database Quickstart
==========================================

The Node Firebase Database quickstart demonstrates how to connect to the Firebase Realtime Database,
send and retrieve data using Node.

Introduction
------------

- [Read more about Firebase Database](https://firebase.google.com/docs/database/)

Getting Started
---------------

- Create your project on the [Firebase Console](https://console.firebase.google.com).
- Create a Service account as described in [Adding Firebase to your Server](https://firebase.google.com/docs/server/setup) and drop the file in this directory.
- Change the placeholders in `index.js`.
- Run `npm install`.
- Run `node index.js` to run the node app locally.
- Open the **Database** section of your project in the [Firebase Console](https://console.firebase.google.com) and manually add messages in the form:

```
/root
  /messages
    /1
      /text: Hello
    /2
      /text: World
```

The text should be Uppercased automatically by your Node.JS app.

Support
-------

https://firebase.google.com/support/

License
-------

© Google, 2016. Licensed under an [Apache-2](../LICENSE) license.
