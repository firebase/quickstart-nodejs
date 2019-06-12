const firebase = require("@firebase/testing");
const fs = require("fs");
const projectId = "rules-codelab";

it("a random user can write a random document", async () => {
  const db = firebase.initializeTestApp({ projectId, auth: null }).firestore();
  await firebase.assertSucceeds(
    db.collection("random-collection").doc("random-document").set({ hello: "world" })
  );
});
