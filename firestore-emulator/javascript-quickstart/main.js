const firebase = require("@firebase/testing");

const projectId = "firestore-emulator-example";
async function main() {
  console.log("starting");
  await firebase.clearFirestoreData({ projectId });
  await uploadFunctions();

  console.log("cleared db");
  const db = firebase.initializeTestApp({ projectId, auth: null }).firestore();
  const doc = await db.collection("counters").add({ value: 0 });
  console.log(`initialized ${doc.id} to 0, waiting for it to increment...`);

  await new Promise(resolve => {
    doc.onSnapshot(snap => {
        console.log("snap = ", snap.data());
        if (snap.data().value >= 10) {
            resolve();
        }
    });
  });
}

main().catch(err => {
  console.error(err);
}).then(() => {
  firebase.apps().forEach(app => app.delete());
});

async function uploadFunctions() {
  console.log("TODO: actually upload function triggers...");
  return Promise.resolve(null);
}
