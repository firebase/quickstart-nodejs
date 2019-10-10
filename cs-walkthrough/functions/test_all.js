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

const FIREBASE_PROJECT_ID = "something"
const TEST_FIREBASE_PROJECT_ID = "test-firestore-rules-project";

const firebase = require("@firebase/testing");

const seedItems = {
  "chocolate": 4.99,
  "coffee beans": 12.99,
  "milk": 5.99
};
const newItem = {
  "strawberries": 6.99
};
const aliceAuth = {
  uid: "alice",
  email: "alice@example.com"
};

after(() => {
  firebase.apps().forEach(app => app.delete());
});

describe("shopping cart creation", () => {
  const projectId = "cart-security-tests";
  const admin = firebase.initializeAdminApp({ projectId}).firestore();
  const db = firebase.initializeTestApp({
    projectId: projectId,
    auth: aliceAuth
  }).firestore();

  after(() => {
    firebase.clearFirestoreData({projectId: "emulator-codelab-dev"});
  });

  it('can be created by the cart owner', async () => {
    await firebase.assertSucceeds(db.doc("carts/alicesCart").set({
      ownerUID: "alice",
      total: 0
    }));
  });

  it("cannot be created by user other than the cart owner", async () => {
    // All requests are being made by Alice; testing that she cannot create
    // a cart owned by a different user.
    await firebase.assertFails(db.doc("carts/adamsCart").set({
      ownerUID: "adam",
      items: seedItems
    }));
  });
});

describe("shopping cart reads, updates, and deletes", () => {
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

    // Create Bart's cart
    await admin.doc("carts/bartsCart").set({
      ownerUID: "bart",
      total: 0
    });
  });

  after(() => {
    firebase.clearFirestoreData({ projectId: TEST_FIREBASE_PROJECT_ID });
  });

  // Cart reads
  it("cart can be read by the cart owner", async () => {
    await firebase.assertSucceeds(db.doc("carts/alicesCart").get());
  });

  it("cart cannot be read by a user other than the cart owner", async () => {
    await firebase.assertFails(db.doc("carts/bartsCart").get());
  });

  // Cart updates
  it("cart can be updated by the cart owner", async () => {
    await firebase.assertSucceeds(db.doc("carts/alicesCart").update({
      arbitraryAttribute: true
    }));
  });

  it("cart cannot be updated by a user other than the cart owner", async () => {
    await firebase.assertSucceeds(db.doc("carts/alicesCart").update({
      arbitraryAttribute: true
    }));
  });


  // Cart deletes
  it("cart can be deleted by the cart owner", async () => {
    await firebase.assertSucceeds(db.doc("carts/alicesCart").delete());
  });

  it("cart cannot be deleted by a user other than the cart owner", async () => {
    await firebase.assertFails(db.doc("carts/bartsCart/items/lemon").delete());
  });

});

describe("cart items creates, reads, updates, and deletes", () => {
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

    // Create Bart's cart
    await admin.doc("carts/bartsCart").set({
      ownerUID: "bart",
      total: 0
    });

    // Create Items Subcollection in Alice's Cart
    const alicesItemsRef = admin.doc("carts/alicesCart").collection("items");
    Object.keys(seedItems).forEach(name => {
      alicesItemsRef.doc(name).set({ value: seedItems[name] });
    });

    // Create Items Subcollection in Bart's Cart
    const bartsItemsRef = admin.doc("carts/bartsCart").collection("items");
    Object.keys(seedItems).forEach(name => {
      bartsItemsRef.doc(name).set({ name: name, value: seedItems[name] });
    });
  });

  after(() => {
    firebase.clearFirestoreData({ projectId: TEST_FIREBASE_PROJECT_ID });
  });

  // Item creates
  it('items can be added to a cart by the cart owner', async () => {
    await firebase.assertSucceeds(db.doc("carts/alicesCart/items/coffee").set({
      name: "Decaf Coffee Beans",
      price: 12.99,
    }));
  });

  it('items cannot be added to a cart by a user other than the cart owner', async () => {
    await firebase.assertFails(db.doc("carts/bartsCart/items/coffee").set({
      name: "Decaf Coffee Beans",
      price: 12.99,
    }));
  });

  // Item reads
  it("items can be read by the cart owner", async () => {
    await firebase.assertSucceeds(db.doc("carts/alicesCart/items/milk").get());
  });

  it("items cannot be read by a user other than the cart owner", async () => {
    await firebase.assertFails(db.doc("carts/bartsCart/items/milk").get());
  });

  // Item updates
  it("items can be updated by the cart owner", async () => {
    await firebase.assertSucceeds(db.doc("carts/alicesCart/items/lemon").set({
      name: "lemon",
      price: .99
    }));
  });

  it("items cannot be updated by a user other than the cart owner", async () => {
    await firebase.assertFails(db.doc("carts/bartsCart/items/lemon").set({
      name: "lemon",
      price: .99
    }));
  });

  // Item deletes
  it("items can be deleted by the cart owner", async () => {
    await firebase.assertSucceeds(
      db.doc("carts/alicesCart/items/milk").delete()
    );
  });

  it("items cannot be deleted by a user other than the cart owner", async () => {
    await firebase.assertFails(
      db.doc("carts/bartsCart/items/milk").delete()
    );
  });
});
