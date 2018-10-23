const firebase = require('@firebase/testing');
const fs = require('fs');
require('@firebase/database'); // Required for side-effects
/*
 * ============
 *    Setup
 * ============
 */
const databaseName = 'emulator-example';

/**
 * Creates a new app with authentication data matching the input.
 *
 * @param {object} auth the object to use for authentication (typically {uid: some-uid})
 * @return {object} the app.
 */
function authedApp(auth) {
  return firebase.initializeTestApp({
    databaseName: databaseName,
    auth: auth,
  });
}

/**
 * Creates a new admin app.
 *
 * @return {object} the app.
 */
function adminApp() {
  return firebase.initializeAdminApp({databaseName: databaseName});
}

before(async () => {
  // Set database rules before running these tests
  await firebase.loadDatabaseRules({
    databaseName: databaseName,
    rules: fs.readFileSync('database.rules.json'),
  });
});

beforeEach(async () => {
  // Clear the database between tests
  await adminApp().database().ref().set(null);
});

afterEach(async () => {
  // Close any open apps
  await Promise.all(firebase.apps().map((app) => app.delete()));
});

/*
 * ============
 *  Test Cases
 * ============
 */
describe('profile read rules', () => {
  it('should allow anyone to read profiles', async () => {
    const alice = authedApp({uid: 'alice'});
    const bob = authedApp({uid: 'bob'});
    const noone = authedApp(null);

    await adminApp().database().ref('users/alice').set({
      name: 'Alice',
      profilePicture: 'http://cool_photos/alice.jpg',
    });

    await firebase.assertSucceeds(alice.database().ref('users/alice').once('value'));
    await firebase.assertSucceeds(bob.database().ref('users/alice').once('value'));
    await firebase.assertSucceeds(noone.database().ref('users/alice').once('value'));
  });

  it('should only allow users to modify their own profiles', async () => {
    const alice = authedApp({uid: 'alice'});
    const bob = authedApp({uid: 'bob'});
    const noone = authedApp(null);

    await firebase.assertSucceeds(alice.database().ref('users/alice').update({
      'favorite_color': 'blue',
    }));
    await firebase.assertFails(bob.database().ref('users/alice').update({
      'favorite_color': 'red',
    }));
    await firebase.assertFails(noone.database().ref('users/alice').update({
      'favorite_color': 'orange',
    }));
  });
});

describe('room creation', () => {
  it('should require the user creating a room to be its owner', async () => {
    const alice = authedApp({uid: 'alice'});

    await firebase.assertFails(
        alice.database().ref('rooms/room1').set({owner: 'bob'}),
        'should not be able to create room owned by another user'
    );
    await firebase.assertFails(
        alice.database().ref('rooms/room1').set({members: {'alice': true}}),
        'should not be able to create room with no owner'
    );
    await firebase.assertSucceeds(
        alice.database().ref('rooms/room1').set({owner: 'alice'}),
        'alice should be allowed to create a room she owns'
    );
  });
});

describe('room members', () => {
  it('must be added by the room owner', async () => {
    const ownerId = 'room_owner';
    const owner = authedApp({uid: ownerId});
    await owner.database().ref('rooms/room1').set({owner: ownerId});

    const aliceId = 'alice';
    const alice = authedApp({uid: aliceId});

    await firebase.assertFails(
        alice.database().ref('rooms/room1/members/rando').set(true),
        'alice cannot add random people to a room'
    );
    await firebase.assertFails(
        alice.database().ref('rooms/room1/members/alice').set(true),
        'alice cannot add herself to a room'
    );
    await firebase.assertSucceeds(
        owner.database().ref('rooms/room1/members/alice').set(true),
        'the owner can add alice to a room'
    );
  });
});
