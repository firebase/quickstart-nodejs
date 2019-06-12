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

If all goes well, you should see
```
> mocha

  ✓ a random user can write a random document
```

## Securing your data

Open `firestore.rules` and you'll see that your rules are currently allowing
all reads and writes. Let's start by locking down the database.

Set your security rules to
```
service cloud.firestore {
  match /databases/{db}/documents {
    match /{doc=**} {
      allow read, write: if false;
    }
  }
}
```

Re-run your test and you should see

```
> mocha



  1) a random user can write a random document

  0 passing (787ms)
  1 failing

  1) a random user can write a random document:
     FirebaseError: 7 PERMISSION_DENIED: 
false for 'create' @ L4
```

which verifies that our rules are no longer allowing random users to write to
random documents. Let's update the test. Open `test/test.js` and change
`firebase.assertSucceeds` to `firebase.assertFails`.
