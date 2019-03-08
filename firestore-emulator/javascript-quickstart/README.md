# Cloud Firestore emulator quickstart

Let's try writing some simple tests for our security rules.

## Setup

### Install Node dependencies

Run `npm install` from this directory, and make sure that you have a recent
version of the [Firebase CLI tool](https://github.com/firebase/firebase-tools)
installed (you'll need `firebase --version` to be at least `6.3.0`).

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
    ✓ must have counter initialized at zero (84ms)
    ✓ can't delete a counter (40ms)
    ✓ must have counter incremented by one (69ms)

View rule coverage information at http://localhost:8080/emulator/v1/projects/firestore-emulator-example:ruleCoverage.html


  3 passing (296ms)
```
