# Cloud Firestore emulator quickstart

Let's try writing some simple tests for our security rules.

## Setup

### Install Node dependencies

Run `npm install` from this directory.

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
which runs all the tests in the `tests/` directory. At
the beginning, you should see 5 tests pass and 1 tests fail.

```
    ✓ require users to log in before creating a profile
    1) should let anyone create their own profile
    ✓ should let anyone read any profile
    ✓ should let anyone create a room
    ✓ should force people to name themselves as room owner when creating a room
    ✓ should not let one user steal a room from another user


  5 passing
  1 failing
```

## Making the tests pass

The tests fail because they expect the rules to block unauthorized writes to a location. To fix
this, go to the firestore.rules and uncomment the rule on line 5:

```
allow write: if request.auth.uid != null;
```

If we re-run the tests now, they should all pass.
```
npm test
```

should give you output like
```
    ✓ require users to log in before creating a profile
    ✓ should let anyone create their own profile 
    ✓ should let anyone read any profile
    ✓ should let anyone create a room
    ✓ should force people to name themselves as room owner when creating a room
    ✓ should not let one user steal a room from another user


  6 passing
```
