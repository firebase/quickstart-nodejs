// Reference mocha-typescript's global definitions:
/// <reference path='../node_modules/mocha-typescript/globals.d.ts' />
import * as firebase from "@firebase/testing";
import * as fs from "fs";

/*
 * ============
 *    Setup
 * ============
 */
const databaseName = "database-emulator-example";
const coverageUrl = `http://localhost:9000/.inspect/coverage?ns=${databaseName}`;

const rules = fs.readFileSync("database.rules.json", "utf8");

/**
 * Creates a new app with authentication data matching the input.
 *
 * @param {object} auth the object to use for authentication (typically {uid: some-uid})
 * @return {object} the app.
 */
function authedApp(auth) {
  return firebase
    .initializeTestApp({
      databaseName: databaseName,
      auth: auth
    })
    .database();
}

/**
 * Creates a new admin app.
 *
 * @return {object} the app.
 */
function adminApp() {
  return firebase.initializeAdminApp({ databaseName: databaseName }).database();
}

/*
 * ============
 *  Test Cases
 * ============
 */
class TestingBase {
  async before() {
    // Set database rules before running these tests
    await firebase.loadDatabaseRules({
      databaseName: databaseName,
      rules: rules
    });
  }

  async beforeEach() {
    // Clear the database between tests
    await adminApp()
      .ref()
      .set(null);
  }

  async after() {
    // Close any open apps
    await Promise.all(firebase.apps().map(app => app.delete()));
  }
}

@suite
class ProfileReadRules extends TestingBase {
  @test
  async "should allow anyone to read profiles"() {
    const alice = authedApp({ uid: "alice" });
    const bob = authedApp({ uid: "bob" });
    const noone = authedApp(null);

    await adminApp()
      .ref("users/alice")
      .set({
        name: "Alice",
        profilePicture: "http://cool_photos/alice.jpg"
      });

    await firebase.assertSucceeds(alice.ref("users/alice").once("value"));
    await firebase.assertSucceeds(bob.ref("users/alice").once("value"));
    await firebase.assertSucceeds(noone.ref("users/alice").once("value"));
  }

  @test
  async "should only allow users to modify their own profiles"() {
    const alice = authedApp({ uid: "alice" });
    const bob = authedApp({ uid: "bob" });
    const noone = authedApp(null);

    await firebase.assertSucceeds(
      alice.ref("users/alice").update({
        favorite_color: "blue"
      })
    );
    await firebase.assertFails(
      bob.ref("users/alice").update({
        favorite_color: "red"
      })
    );
    await firebase.assertFails(
      noone.ref("users/alice").update({
        favorite_color: "orange"
      })
    );
  }
}

@suite
class RoomCreation extends TestingBase {
  @test
  async "should require the user creating a room to be its owner"() {
    const alice = authedApp({ uid: "alice" });

    // should not be able to create room owned by another user
    await firebase.assertFails(alice.ref("rooms/room1").set({ owner: "bob" }));
    // should not be able to create room with no owner
    await firebase.assertFails(
      alice.ref("rooms/room1").set({ members: { alice: true } })
    );
    // alice should be allowed to create a room she owns
    await firebase.assertSucceeds(
      alice.ref("rooms/room1").set({ owner: "alice" })
    );
  }
}

@suite
class RoomMembers extends TestingBase {
  @test
  async "must be added by the room owner"() {
    const ownerId = "room_owner";
    const owner = authedApp({ uid: ownerId });
    await owner.ref("rooms/room2").set({ owner: ownerId });

    const aliceId = "alice";
    const alice = authedApp({ uid: aliceId });
    // alice cannot add random people to a room
    await firebase.assertFails(
      alice.ref("rooms/room2/members/rando").set(true)
    );
    // alice cannot add herself to a room
    await firebase.assertFails(
      alice.ref("rooms/room2/members/alice").set(true)
    );
    // the owner can add alice to a room
    await firebase.assertSucceeds(
      owner.ref("rooms/room2/members/alice").set(true)
    );
  }
}

process.on('exit', () => console.log(`View rule coverage information at ${coverageUrl}\n`));
