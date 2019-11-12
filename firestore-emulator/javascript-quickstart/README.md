# Cloud Firestore emulator quickstart

Let's try writing some simple tests for our security rules.

## Setup

### Install Node dependencies

Run `npm install` from this directory, and make sure that you have a recent
version of the [Firebase CLI tool](https://github.com/firebase/firebase-tools)
installed (you'll need `firebase --version` to be at least `6.3.0`).

### Running the tests with the emulator

To start the firestore emulator and run the tests:
```
firebase emulators:exec --only firestore 'npm test'
```

If another app's using the port, update the firebase.json file to
look like this before you run the command above.
```
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "emulators": {
    "firestore": {
      "port": "PORT"
    }
  }
}
```

Either way, the command runs all the tests in the `tests/` directory.

```
    ✓ require users to log in before creating a profile (71ms)
    ✓ should enforce the createdAt date in user profiles (79ms)
    ✓ should only let users create their own profile (57ms)
    ✓ should let anyone read any profile (40ms)
    ✓ should let anyone create a room (44ms)
    ✓ should force people to name themselves as room owner when creating a room (48ms)
    ✓ should not let one user steal a room from another user (119ms)


  7 passing (607ms)
```
