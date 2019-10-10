// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const fs = require('fs');
const path = require("path");

const TEST_FIREBASE_PROJECT_ID = "test-firestore-rules-project";

// TODO: Change this to your real Firebase Project ID
const REAL_FIREBASE_PROJECT_ID = "changeme";

const firebase = require("@firebase/testing");

const seedItems = {
  "chocolate": 4.99,
  "coffee beans": 12.99,
  "milk": 5.99
};

const aliceAuth = {
  uid: "alice",
  email: "alice@example.com"
};

before(async () => {
  // Load the content of the "firestore.rules" file into the emulator before running the
  // test suite. This is necessary because we are using a fake Project ID in the tests,
  // so the rules "hot reloading" behavior which works in the Web App does not apply here.
  const rulesContent = fs.readFileSync(path.resolve(__dirname, "../firestore.rules"));
  await firebase.loadFirestoreRules({
    projectId: TEST_FIREBASE_PROJECT_ID,
    rules: rulesContent
  });
});

after(() => {
  firebase.apps().forEach(app => app.delete());
});

// Unit test the security rules
describe("shopping carts", () => {

  const db = firebase.initializeTestApp({
    projectId: TEST_FIREBASE_PROJECT_ID,
    auth: aliceAuth
  }).firestore();

  after(() => {
    // Clear data from the emulator
    firebase.clearFirestoreData({ projectId: TEST_FIREBASE_PROJECT_ID });
  });

  it('can be created by the cart owner', async () => {
    await firebase.assertSucceeds(db.doc("carts/alicesCart").set({
      ownerUID: "alice",
      total: 0
    }));
  });
});

describe("shopping carts", async () => {
  const db = firebase.initializeTestApp({
    projectId: TEST_FIREBASE_PROJECT_ID,
    auth: aliceAuth
  }).firestore();

  before(async () => {
    const admin = firebase.initializeAdminApp({
      projectId: TEST_FIREBASE_PROJECT_ID
    }).firestore();

    // Create Alice's cart
    await admin.doc("carts/alicesCart").set({
      ownerUID: "alice",
      total: 0
    });
  });

  after(() => {
    // Clear data from the emulator
    firebase.clearFirestoreData({ projectId: TEST_FIREBASE_PROJECT_ID });
  });

  it("can be read, updated, and deleted by the cart owner", async () => {
    await firebase.assertSucceeds(db.doc("carts/alicesCart").get());
  });
});

describe("shopping cart items", async () => {
  const db = firebase.initializeTestApp({
    projectId: TEST_FIREBASE_PROJECT_ID,
    auth: aliceAuth
  }).firestore();

  before(async () => {
    const admin = firebase.initializeAdminApp({
      projectId: TEST_FIREBASE_PROJECT_ID
    }).firestore();

    // Create Alice's cart
    await admin.doc("carts/alicesCart").set({
      ownerUID: "alice",
      total: 0
    });

    // Create Items Subcollection in Alice's Cart
    const alicesItemsRef = admin.doc("carts/alicesCart").collection("items");
    for (const name of Object.keys(seedItems)) {
      await alicesItemsRef.doc(name).set({ value: seedItems[name] });
    }
  });

  after(() => {
    // Clear data from the emulator
    firebase.clearFirestoreData({ projectId: TEST_FIREBASE_PROJECT_ID });
  });

  it("can be read by the cart owner", async () => {
    await firebase.assertSucceeds(db.doc("carts/alicesCart/items/milk").get());
  });

  it("can be added by the cart owner",  async () => {
    await firebase.assertSucceeds(db.doc("carts/alicesCart/items/lemon").set({
      name: "lemon",
      price: 0.99
    }));
  });
});

describe.skip("adding an item to the cart recalculates the cart total. ", () => {
  let unsubscribe;

  after(() => {
    // Clear data from the emulator
    firebase.clearFirestoreData({projectId: REAL_FIREBASE_PROJECT_ID});
    // Call the function returned by `onSnapshot` to unsubscribe from updates
    if (unsubscribe) {
      unsubscribe();
    }
  });

  it("should sum the cost of their items", (done) => {
    if (REAL_FIREBASE_PROJECT_ID == "changeme") {
      throw new Error("Please change the REAL_FIREBASE_PROJECT_ID at the top of the test file");
    }

    const db = firebase
        .initializeAdminApp({ projectId: REAL_FIREBASE_PROJECT_ID })
        .firestore();

    // Setup: Initialize cart
    const aliceCartRef = db.doc("carts/alice")
    aliceCartRef.set({ ownerUID: "alice", totalPrice: 0 });

    //  Trigger `calculateCart` by adding items to the cart
    const aliceItemsRef = aliceCartRef.collection("items");
    aliceItemsRef.doc("doc1").set({name: "nectarine", price: 2.99});
    aliceItemsRef.doc("doc2").set({ name: "grapefruit", price: 6.99 });

    // Listen for every update to the cart. Every time an item is added to
    // the cart's subcollection of items, the function updates `totalPrice`
    // and `itemCount` attributes on the cart.
    // Returns a function that can be called to unsubscribe the listener.
    unsubscribe = aliceCartRef.onSnapshot(snap => {
      // If the function worked, these will be cart's final attributes.
      const expectedCount = 2;
      const expectedTotal = 9.98;

      // When the `itemCount`and `totalPrice` match the expectations for the
      // two items added, the promise resolves, and the test passes.
      if (snap.data().itemCount === expectedCount && snap.data().totalPrice == expectedTotal) {
        done();
      };
    });
  });

});
