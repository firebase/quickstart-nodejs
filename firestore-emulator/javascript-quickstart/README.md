# Cloud Firestore emulator quickstart

Let's try writing some simple tests for our security rules.

## Setup

### Start in the right directory

To use this, some people may clone the entire quickstart-nodejs directory.
When starting the quickstart, cd to the specific quickstart related to your
project (i.e. `cd firestore-emulator/javascript-quickstart`).

### Install Node dependencies

Run `npm install` from this directory, and make sure that you have a recent
version of the [Firebase CLI tool](https://github.com/firebase/firebase-tools)
installed (you'll need `firebase --version` to be at least `6.3.0`).

### Running the emulator

Setup the Firestore emulator
```
firebase setup:emulators:firestore
```
Add your project to the emulator (use `firebase init` if no project setup)
```
firebase use --add your-project-name
```
If another app's using the 8080 port, update the firebase.json file to
look like this
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
Start the firestore emulator (and leave it running during the tests)
```
firebase emulators:start --only firestore
```

## Running the tests

To run the tests, open a new terminal (in your specific quickstart directory, not '/quickstart-nodejs') and execute
```
npm test
```
which runs all the tests in the `tests/` directory.

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
