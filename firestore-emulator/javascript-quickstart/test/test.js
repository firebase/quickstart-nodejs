const firebase = require("@firebase/testing");
const fs = require("fs");

/*
 * ============
 *    Setup
 * ============
 */
const projectName = "firestore-emulator-example";
const coverageUrl = `http://localhost:8080/emulator/v1/projects/${projectName}:ruleCoverage.html`;

const rules = fs.readFileSync("firestore.rules", "utf8");

/**
 * Creates a new app with authentication data matching the input.
 *
 * @param {object} auth the object to use for authentication (typically {uid: some-uid})
 * @return {object} the app.
 */
function authedApp(auth) {
  return firebase
    .initializeTestApp({ projectId: projectName, auth })
    .firestore();
}

/*
 * ============
 *  Test Cases
 * ============
 */
beforeEach(async () => {
  // Clear the database between tests
  await firebase.clearFirestoreData({
    projectId: projectName
  });
});

before(async () => {
  await firebase.loadFirestoreRules({
    projectId: projectName,
    rules: rules
  });
});

after(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
  console.log(`View rule coverage information at ${coverageUrl}\n`);
});

describe("My app", () => {
  it("must have counter initialized at zero", async () => {
    const db = authedApp(null);
    const counter0 = db.collection("counters").doc("0");
    await firebase.assertFails(counter0.set({value: 1}));
    await firebase.assertSucceeds(counter0.set({value: 0}));
  });

  it("can't delete a counter", async () => {
    const db = authedApp(null);
    const counter0 = db.collection("counters").doc("0");
    await firebase.assertFails(counter0.delete());
  });

  it("must have counter incremented by one", async () => {
    const db = authedApp(null);
    const counter0 = db.collection("counters").doc("0");
    await firebase.assertSucceeds(counter0.set({value: 0}));
    await firebase.assertFails(counter0.set({value: 1.5}));
  });
});
