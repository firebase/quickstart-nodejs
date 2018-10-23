// Reference mocha-typescript's global definitions:
// eslint-disable-next-line spaced-comment
/// <reference path='../node_modules/mocha-typescript/globals.d.ts' />
import * as firebase from '@firebase/testing';
import '@firebase/firestore'; // Required for side-effects

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
/* eslint-disable require-jsdoc */
// eslint-disable-next-line no-unused-vars
@suite class UnitTest {
  async after() {
    await Promise.all(firebase.apps().map((app) => app.delete()));
  }
  @test async 'require users to log in before creating a profile'() {
    const db = getApp(null);
    const profile = db.collection('users').doc('ryan');
    await firebase.assertFails(profile.set({birthday: 'November 20'}));
  }

  @test async 'should let anyone create their own profile'() {
    const db = getApp({uid: 'ryan'});
    const profile = db.collection('users').doc('ryan');
    await firebase.assertSucceeds(profile.set({birthday: 'November 20'}));
  }

  @test async 'should let anyone read any profile'() {
    const db = getApp(null);
    const profile = db.collection('users').doc('ryan');
    await firebase.assertSucceeds(profile.get());
  }

  @test async 'should let anyone create a room'() {
    const db = getApp({uid: 'ryan'});
    const room = db.collection('rooms').doc('firebase');
    await firebase.assertSucceeds(room.set({
      owner: 'ryan',
      topic: 'All Things Firebase',
    }));
  }

  @test async 'should force people to name themselves as room owner when creating a room'() {
    const db = getApp({uid: 'ryan'});
    const room = db.collection('rooms').doc('firebase');
    await firebase.assertFails(room.set({
      owner: 'scott',
      topic: 'Firebase Rocks!',
    }));
  }

  @test async 'should not let one user steal a room from another user'() {
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
  }
}
/* eslint-enable require-jsdoc */
