# Cloud Firestore emulator quickstart

Let's try writing some simple tests for our security rules.

## Setup

### Install Node dependencies

Run `npm install` from this directory, and make sure that you have a recent
version of the [Firebase CLI tool](https://github.com/firebase/firebase-tools)
installed (you'll need `firebase --version` to be at least `6.1.1`).

### Running the emulator

Setup the Firestore emulator
```
firebase setup:emulators:firestore
```
Start the firestore emulator (and leave it running during the tests)
```
firebase serve --only firestore
```

## Running the tests

To run the tests, execute
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
