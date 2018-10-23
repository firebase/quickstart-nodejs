# Cloud Firestore emulator quickstart

Let's try writing some simple tests for our security rules.

## Setup

### Install Node dependencies

If you're in this directory, you should be able to just run `npm install`.

### Running the emulator

Make sure you've Opted-in to the emulator beta:
```
firebase --open-sesame emulators
firebase setup:emulators:firestore
```
Start the database emulator (and leave it running during the tests)
```
firebase serve --only firestore
```

## Running the tests

To run the tests, execute
```
npm test
```
which will execute `mocha`, running all the tests in the `tests/` directory. At
the beginning, you should see 3 tests pass and 3 tests fail.

```
    1) require users to log in before creating a profile
    ✓ should let anyone create their own profile (41ms)
    ✓ should let anyone read any profile (41ms)
    ✓ should let anyone create a room
    2) should force people to name themselves as room owner when creating a room
    3) should not let one user steal a room from another user


  3 passing (337ms)
  3 failing
```

## Making the tests pass

The tests fail because they're checking for security rules behavior that isn't
being enforced. By default, the Cloud Firestore emulator runs with completely
open security rules. Let's use something a bit more secure. This directory
contains a file named `firestore.rules`. Let's restart the emulator and have it
use those rules instead of the defaults.

```
firebase serve --only firestore --rules=firestore.rules
```

If we re-run the tests now, they should all pass.
```
npm test
```

should give you output like
```
    ✓ require users to log in before creating a profile (871ms)
    ✓ should let anyone create their own profile (91ms)
    ✓ should let anyone read any profile (60ms)
    ✓ should let anyone create a room (56ms)
    ✓ should force people to name themselves as room owner when creating a room (40ms)
    ✓ should not let one user steal a room from another user (79ms)


  6 passing (1s)
```
