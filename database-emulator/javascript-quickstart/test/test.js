let firebase = require("@firebase/testing");
fs = require('fs');
// Required for side-effects
require("@firebase/database");

const databaseName = "emulator-example";

function authedApp(auth) {
  return firebase.initializeTestApp({
    databaseName: databaseName,
    auth: auth
  });
}

function adminApp() {
  return firebase.initializeAdminApp({ databaseName: databaseName })
}

before(async function() {
  // Set database rules before running these tests
  await firebase.loadDatabaseRules({
    databaseName: databaseName,
    rules: fs.readFileSync('database.rules.json')
  });
});

beforeEach(async function() {
  // Clear the database between tests
  await adminApp().database().ref().set(null);
});

afterEach(async function() {
  // Close any open apps
  await Promise.all(firebase.apps().map(app => app.delete()));
});


/**************
 * TEST CASES *
 **************/
describe("profile read rules", function() {
  it("should allow anyone to read profiles", async function() {
    let alice = authedApp({ uid: "alice" });
    let bob = authedApp({ uid: "bob" });
    let noone = authedApp(null);

    await adminApp().database().ref("users/alice").set({
      name: "Alice",
      profilePicture: "http://cool_photos/alice.jpg"
    });

    await firebase.assertSucceeds(alice.database().ref("users/alice").once("value"));
    await firebase.assertSucceeds(bob.database().ref("users/alice").once("value"));
    await firebase.assertSucceeds(noone.database().ref("users/alice").once("value"));
  });

  it("should only allow users to modify their own profiles", async function() {
    let alice = authedApp({ uid: "alice" });
    let bob = authedApp({ uid: "bob" });
    let noone = authedApp(null);

    await firebase.assertSucceeds(alice.database().ref("users/alice").update({
      "favorite_color": "blue"
    }));
    await firebase.assertFails(bob.database().ref("users/alice").update({
      "favorite_color": "red"
    }));
    await firebase.assertFails(noone.database().ref("users/alice").update({
      "favorite_color": "orange"
    }));
  });
});

describe("room creation", function() {
  it("should require the user creating a room to be its owner", async function() {
    let alice = authedApp({ uid: "alice" });

    await firebase.assertFails(
      alice.database().ref("rooms/room1").set({ owner: "bob" }),
      "should not be able to create room owned by another user"
    );
    await firebase.assertFails(
      alice.database().ref("rooms/room1").set({ members: { "alice": true } }),
      "should not be able to create room with no owner"
    );
    await firebase.assertSucceeds(
      alice.database().ref("rooms/room1").set({ owner: "alice" }),
      "alice should be allowed to create a room she owns"
    );
  });
});

describe("room members", function() {
  it("must be added by the room owner", async function() {
    let owner_id = "room_owner";
    let owner = authedApp({ uid: owner_id });
    await owner.database().ref("rooms/room1").set({ owner: owner_id });

    let alice_id = "alice";
    let alice = authedApp({ uid: alice_id });

    await firebase.assertFails(
      alice.database().ref("rooms/room1/members/rando").set(true),
      "alice cannot add random people to a room"
    );
    await firebase.assertFails(
      alice.database().ref("rooms/room1/members/alice").set(true),
      "alice cannot add herself to a room"
    );
    await firebase.assertSucceeds(
      owner.database().ref("rooms/room1/members/alice").set(true),
      "the owner can add alice to a room"
    );
  });
});
