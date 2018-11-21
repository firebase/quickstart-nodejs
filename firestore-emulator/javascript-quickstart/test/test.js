const firebase = require("@firebase/testing");
const fs = require("fs");

/*
 * ============
 *    Setup
 * ============
 */
const projectIdBase = "firestore-emulator-example-" + Date.now();

const rules = fs.readFileSync("firestore.rules", "utf8");

// Run each test in its own project id to make it independent.
let testNumber = 0;

/**
 * Returns the project ID for the current test
 *
 * @return {string} the project ID for the current test.
 */
function getProjectId() {
  return `${projectIdBase}-${testNumber}`;
}

beforeEach(async () => {
  // Create new project ID for each test.
  testNumber++;
  await firebase.loadFirestoreRules({
    projectId: getProjectId(),
    rules: rules
  });
});

after(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
});


/**
 * Creates a new app with authentication data matching the input.
 *
 * @param {object} auth the object to use for authentication (typically {uid: some-uid})
 * @return {object} the app.
 */
function authedApp(auth) {
  return firebase
    .initializeTestApp({
      projectId: getProjectId(),
      auth: auth
    })
    .firestore();
}

/*
 * ============
 *  Test Cases
 * ============
 */
describe("My app", () => {
  it("require users to log in before creating a profile", async () => {
    const db = authedApp(null);
    const profile = db.collection("users").doc("alice");
    await firebase.assertFails(profile.set({ birthday: "January 1" }));
  });

  it("should enforce the createdAt date in user profiles", async () => {
    const db = authedApp({ uid: "alice" });
    const profile = db.collection("users").doc("alice");
    await firebase.assertFails(profile.set({ birthday: "January 1" }));
    await firebase.assertSucceeds(
      profile.set({
        birthday: "January 1",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      })
    );
  });

  it("should only let users create their own profile", async () => {
    const db = authedApp({ uid: "alice" });
    await firebase.assertSucceeds(
      db
        .collection("users")
        .doc("alice")
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      db
        .collection("users")
        .doc("bob")
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
  });

  it("should let anyone read any profile", async () => {
    const db = authedApp(null);
    const profile = db.collection("users").doc("alice");
    await firebase.assertSucceeds(profile.get());
  });

  it("should let anyone create a room", async () => {
    const db = authedApp({ uid: "alice" });
    const room = db.collection("rooms").doc("firebase");
    await firebase.assertSucceeds(
      room.set({
        owner: "alice",
        topic: "All Things Firebase"
      })
    );
  });

  it("should force people to name themselves as room owner when creating a room", async () => {
    const db = authedApp({ uid: "alice" });
    const room = db.collection("rooms").doc("firebase");
    await firebase.assertFails(
      room.set({
        owner: "scott",
        topic: "Firebase Rocks!"
      })
    );
  });

  it("should not let one user steal a room from another user", async () => {
    const alice = authedApp({ uid: "alice" });
    const bob = authedApp({ uid: "bob" });

    await firebase.assertSucceeds(
      bob
        .collection("rooms")
        .doc("snow")
        .set({
          owner: "bob",
          topic: "All Things Snowboarding"
        })
    );

    await firebase.assertFails(
      alice
        .collection("rooms")
        .doc("snow")
        .set({
          owner: "alice",
          topic: "skiing > snowboarding"
        })
    );
  });
});
