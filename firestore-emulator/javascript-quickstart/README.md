# Cloud Firestore emulator quickstart

Let's try writing some simple tests for our security rules.

## tl;dr

```
firebase emulators:exec "PATH=$PATH npm test"
```

## Dependencies

* `node`
* `firebase` (the [Firebase CLI tool](https://github.com/firebase/firebase-tools))

## Rules

The rules you're testing are in `firestore.rules`. You can read more about
Firebase security rules [here](http://firebase.google.com/docs/rules).

## Tests

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
