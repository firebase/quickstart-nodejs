const firebase = require("@firebase/testing");
// Required for side-effects
require("@firebase/firestore");

const PROJECT_ID = "my-test-project";
function getApp(auth) {
  return firebase.initializeTestApp({ projectId: PROJECT_ID, auth: auth }).firestore();
}

describe("my app", function() {
  after(async function() {
    await Promise.all(firebase.apps().map(app => app.delete()));
  });

  it("require users to log in before creating a profile", async function() {
    let db = getApp(null);
    let profile = db.collection("users").doc("ryan");
    await firebase.assertFails(profile.set({ birthday: "November 20" }));
  });

  it("should let anyone create their own profile", async function() {
    let db = getApp({ uid: "ryan" });
    let profile = db.collection("users").doc("ryan");
    await firebase.assertSucceeds(profile.set({ birthday: "November 20" }));
  });

  it("should let anyone read any profile", async function() {
    let db = getApp(null);
    let profile = db.collection("users").doc("ryan");
    await firebase.assertSucceeds(profile.get());
  });

  it("should let anyone create a room", async function() {
    let db = getApp({ uid: "ryan" });
    let room = db.collection("rooms").doc("firebase");
    await firebase.assertSucceeds(room.set({
      owner: "ryan",
      topic: "All Things Firebase"
    }));
  });

  it("should force people to name themselves as room owner when creating a room", async function() {
    let db = getApp({ uid: "ryan" });
    let room = db.collection("rooms").doc("firebase");
    await firebase.assertFails(room.set({
      owner: "scott",
      topic: "Firebase Rocks!"
    }));
  })

  it("should not let one user steal a room from another user", async function() {
    let ryan = getApp({ uid: "ryan" });
    let tony = getApp({ uid: "tony" });

    await firebase.assertSucceeds(tony.collection("rooms").doc("snow").set({
      owner: "tony",
      topic: "All Things Snowboarding"
    }));

    await firebase.assertFails(ryan.collection("rooms").doc("snow").set({
      owner: "ryan",
      topic: "skiing > snowboarding"
    }));
  });
});
