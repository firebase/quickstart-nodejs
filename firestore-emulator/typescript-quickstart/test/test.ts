/// <reference path='../node_modules/mocha-typescript/globals.d.ts' />
import * as firebase from "@firebase/testing";
import * as fs from "fs";

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
class TestingBase {
  static async before() {
    await firebase.loadFirestoreRules({
      projectId: projectName,
      rules: rules
    });
  }

  async before() {
    // Clear the database between tests
    await firebase.clearFirestoreData({
      projectId: projectName
    });
  }

  static async after() {
    await Promise.all(firebase.apps().map(app => app.delete()));
    console.log(`\nView rule coverage information at ${coverageUrl}`);
  }
}

@suite
class MyApp extends TestingBase {
  @test
  async "must have counter initialized at zero"() {
    const db = authedApp(null);
    const counter0 = db.collection("counters").doc("0");
    await firebase.assertFails(counter0.set({value: 1}));
    await firebase.assertSucceeds(counter0.set({value: 0}));
  }

  @test
  async "can't delete a counter"() {
    const db = authedApp(null);
    const counter0 = db.collection("counters").doc("0");
    await firebase.assertFails(counter0.delete());
  }

  @test
  async "must have counter incremented by one"() {
    const db = authedApp(null);
    const counter0 = db.collection("counters").doc("0");
    await firebase.assertSucceeds(counter0.set({value: 0}));
    await firebase.assertFails(counter0.set({value: 1.5}));
  }

}
