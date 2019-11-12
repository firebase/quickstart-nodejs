# Realtime Database emulator quickstart

Let's try writing some simple tests for our security rules.

## Setup

### Install Node dependencies

Run `npm install` from this directory, and make sure that you have a recent
version of the [Firebase CLI tool](https://github.com/firebase/firebase-tools)
installed (you'll need `firebase --version` to be at least `7.0.0`).

### Running the tests with the emulator

To start the database emulator and run the tests:
```
firebase emulators:exec --only database 'npm test'
```

If another app's using the port, update the firebase.json file to
look like this before you run the command above.
```
{
  "database": {
    "rules": "database.rules.json"
  },
  "emulators": {
    "database": {
      "port": "PORT"
    }
  }
}
```

Either way, the command runs all the tests in the `tests/` directory.

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
