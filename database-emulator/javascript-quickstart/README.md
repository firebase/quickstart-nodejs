# Realtime Database emulator quickstart

Let's try writing some simple tests for our security rules.

## Setup

### Install Node dependencies

If you're in this directory, you should be able to just run `npm install`.

### Running the emulator

Make sure you've Opted-in to the emulator beta:
```
firebase --open-sesame emulators
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
which will execute `mocha`, running all the tests in the `tests/` directory. At
the beginning, you should see 3 tests pass and 1 tests fail.

```
  profile read rules
    ✓ should allow anyone to read profiles
    1) should only allow users to modify their own profiles

  room creation
    ✓ should require the user creating a room to be its owner

  room members
    ✓ must be added by the room owner


  3 passing
  1 failing
```

## Making the tests pass

The tests fail because they expect the rules to block unauthorized writes to a location. To fix
this, go to the database.rules.json and uncomment the rule on line 6:

```
".write": "auth.uid == $userId"
```

If we re-run the tests now, they should all pass.
```
npm test
```

should give you output like
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
