# Connecting a web app to the Firestore emulator

Cloud Firestore relies heavily on bi-directional streams. Most clients (such as
Android, iOS, and Node.js) connect via gRPC. Browser clients unfortunately
cannot use gRPC bidi streams (see https://github.com/grpc/grpc-web), so Cloud
Firestore also supports the
[WebChannel protocol](https://google.github.io/closure-library/api/goog.net.WebChannel.html).

We are in the process of adding WebChannel support to the Firestore emulator.
It's a little rough at the moment, so please
[file an issue](https://github.com/firebase/firebase-tools/issues) if you run
into any bugs.

## Setup

Start the Firestore and Hosting emulators:
```
firebase emulators:start --only hosting,firestore
```

## Interacting with the page

Once you've run `firebase emulators;start`, you can visit `http://localhost:5000` in your
browser and you should see a _very_ barebones chat app powered by the local
Firestore emulator.

## Running automated tests

Run the test
```
npm test
```

This will create a "headless" instance of Google Chrome, visit the page,
interact with a few UI elements, and assert that they have the correct
behavior.
