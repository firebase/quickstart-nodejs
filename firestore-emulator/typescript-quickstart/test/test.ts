// Reference mocha-typescript's global definitions:
/// <reference path="../node_modules/mocha-typescript/globals.d.ts" />

import * as firebase from "@firebase/testing";
// Required for side-effects
import "@firebase/firestore";

const PROJECT_ID = "my-test-project";
function getApp(auth) {
  return firebase.initializeTestApp({ projectId: PROJECT_ID, auth: auth }).firestore();
}

@suite class UnitTest {
  async after() {
    await Promise.all(firebase.apps().map(app => app.delete()));
  }
  @test async "require users to log in before creating a profile"() {
    let db = getApp(null);
    let profile = db.collection("users").doc("ryan");
    await firebase.assertFails(profile.set({ birthday: "November 20" }));
  }

  @test async "should let anyone create their own profile"() {
    let db = getApp({ uid: "ryan" });
    let profile = db.collection("users").doc("ryan");
    await firebase.assertSucceeds(profile.set({ birthday: "November 20" }));
  }

  @test async "should let anyone read any profile"() {
    let db = getApp(null);
    let profile = db.collection("users").doc("ryan");
    await firebase.assertSucceeds(profile.get());
  }

  @test async "should let anyone create a room"() {
    let db = getApp({ uid: "ryan" });
    let room = db.collection("rooms").doc("firebase");
    await firebase.assertSucceeds(room.set({
      owner: "ryan",
      topic: "All Things Firebase"
    }));
  }

  @test async "should force people to name themselves as room owner when creating a room"() {
    let db = getApp({ uid: "ryan" });
    let room = db.collection("rooms").doc("firebase");
    await firebase.assertFails(room.set({
      owner: "scott",
      topic: "Firebase Rocks!"
    }));
  }

  @test async "should not let one user steal a room from another user"() {
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
  }
}
