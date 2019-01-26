# Realtime Database emulator quickstart

Let's try writing some simple tests for our security rules.

## Setup

### Install Node dependencies

Run `npm install` from this directory, and make sure that you have a recent
version of the [Firebase CLI tool](https://github.com/firebase/firebase-tools)
installed (you'll need `firebase --version` to be at least `6.1.1`).

### Running the emulator

Download the database emulator
```
firebase setup:emulators:database
```
Start the database emulator (and leave it running during the tests)
```
firebase serve --only database
```

## Running the tests

To run the tests, execute
```
npm test
```
which runs all the tests in the `tests/` directory.

```
  profile read rules
    ✓ should allow anyone to read profiles
    ✓ should only allow users to modify their own profiles

  room creation
    ✓ should require the user creating a room to be its owner

  room members
    ✓ must be added by the room owner


  4 passing
```
