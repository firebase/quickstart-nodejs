const firebase = require('@firebase/testing');
require('@firebase/firestore'); // Required for side-effects

/*
 * ============
 *    Setup
 * ============
 */
const PROJECT_ID = 'my-test-project';

/**
 * Creates a new app with authentication data matching the input.
 *
 * @param {object} auth the object to use for authentication (typically {uid: some-uid})
 * @return {object} the app.
 */
function getApp(auth) {
  return firebase.initializeTestApp({projectId: PROJECT_ID, auth: auth}).firestore();
}

/*
 * ============
 *  Test Cases
 * ============
 */
describe('my app', () => {
  after(async () => {
    await Promise.all(firebase.apps().map((app) => app.delete()));
  });

  it('require users to log in before creating a profile', async () => {
    const db = getApp(null);
    const profile = db.collection('users').doc('ryan');
    await firebase.assertFails(profile.set({birthday: 'November 20'}));
  });

  it('should let anyone create their own profile', async () => {
    const db = getApp({uid: 'ryan'});
    const profile = db.collection('users').doc('ryan');
    await firebase.assertSucceeds(profile.set({birthday: 'November 20'}));
  });

  it('should let anyone read any profile', async () => {
    const db = getApp(null);
    const profile = db.collection('users').doc('ryan');
    await firebase.assertSucceeds(profile.get());
  });

  it('should let anyone create a room', async () => {
    const db = getApp({uid: 'ryan'});
    const room = db.collection('rooms').doc('firebase');
    await firebase.assertSucceeds(room.set({
      owner: 'ryan',
      topic: 'All Things Firebase',
    }));
  });

  it('should force people to name themselves as room owner when creating a room', async () => {
    const db = getApp({uid: 'ryan'});
    const room = db.collection('rooms').doc('firebase');
    await firebase.assertFails(room.set({
      owner: 'scott',
      topic: 'Firebase Rocks!',
    }));
  });

  it('should not let one user steal a room from another user', async () => {
    const ryan = getApp({uid: 'ryan'});
    const tony = getApp({uid: 'tony'});

    await firebase.assertSucceeds(tony.collection('rooms').doc('snow').set({
      owner: 'tony',
      topic: 'All Things Snowboarding',
    }));

    await firebase.assertFails(ryan.collection('rooms').doc('snow').set({
      owner: 'ryan',
      topic: 'skiing > snowboarding',
    }));
  });
});
