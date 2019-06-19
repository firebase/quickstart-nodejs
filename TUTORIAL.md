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
npm run ci
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
random documents. Let's update the test. Open
```
test/test.js
```
and change
```
firebase.assertSucceeds
```
to
```
firebase.assertFails
```

## Selective access
Now your database too secure: it won't let any users in. Let's open
it up a little bit, to allow users to read and write their own user profiles, stored at
```
/users/{userId}
```

Let's start by adding a test:
```
it("a user can create their own profile", async () => {
  const db = firebase.initializeTestApp({ projectId, auth: { uid: "alice" } }).firestore();
  await firebase.assertSucceeds(
    db.collection("users").doc("alice").set({ hello: "world" })
  );
});
```

If you run this now, you'll see that it fails. Let's fix up the security rules to allow this.

Modify your rules to look like
```
service cloud.firestore {
  match /databases/{db}/documents {
    match /{doc=**} {
      allow read, write: if false;
    }
    match /users/{userId} {
        allow read, write: if request.auth.uid == userId;
    }
  }
}
```

Re-run the test and it should pass!
