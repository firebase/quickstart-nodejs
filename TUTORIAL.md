# Cloud Firestore rules quickstart

## Getting started

Let's start off by setting up and running our first test.

First we need to install the Cloud Firestore emulator:
```
firebase setup:emulators:firestore
```

Then the test dependencies:
```
npm install
```

Now we're ready to actually run the tests:
```
firebase emulators:exec "npm test"
```
