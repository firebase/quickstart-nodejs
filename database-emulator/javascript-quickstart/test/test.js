const firebase = require("@firebase/testing");
const fs = require("fs");

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
  return firebase.initializeTestApp({ databaseName, auth }).database();
}

/**
 * Creates a new admin app.
 *
 * @return {object} the app.
 */
function adminApp() {
  return firebase.initializeAdminApp({ databaseName }).database();
}

/*
 * ============
 *  Test Cases
 * ============
 */
before(async () => {
  // Set database rules before running these tests
  await firebase.loadDatabaseRules({
    databaseName,
    rules: rules
  });
});

beforeEach(async () => {
  // Clear the database between tests
  await adminApp()
    .ref()
    .set(null);
});

after(async () => {
  // Close any open apps
  await Promise.all(firebase.apps().map(app => app.delete()));
  console.log(`View rule coverage information at ${coverageUrl}\n`);
});

describe("profile read rules", () => {
  it("should allow anyone to read profiles", async () => {
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
  });

  it("should only allow users to modify their own profiles", async () => {
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
  });
});

describe("room creation", () => {
  it("should require the user creating a room to be its owner", async () => {
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
  });
});

describe("room members", () => {
  it("must be added by the room owner", async () => {
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
  });
});
