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
which will execute `mocha`, running all the tests in the `tests/` directory. You should see all
four tests run and pass.

```
    1) profile read rules
    ✓ should allow anyone to read profiles (68ms)
    ✓ should only allow users to modify their own profiles (38ms)
    2) room creation
    ✓ should require the user creating a room to be its owner
    3) room members
    ✓ must be added by the room owner (39ms)
    

  4 passing (271ms)
```
