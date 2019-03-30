const functions = require('firebase-functions');
const firebase = require("@firebase/testing");

const onWrite = (change, context) => {
  const count = change.after.data().value;
  if (count <= 10) {
    return change.after.ref.set({ value: count + 1 }, { merge: true });
  }
};

/* This should not be needed once functions SDK parses data correctly. */
const onWriteWithParsingHack = (data, context) => {
  console.log(data);
  const [_, projectId, __, databaseId, ___, collId, docId] =
    data.value.name.split('/');
  const db = firebase.initializeTestApp({ projectId, auth: null }).firestore();

  const change = {
    after: {
      ref: db.collection(collId).doc(docId),
      data() {
        return {value: parseInt(data.value.fields.value.integerValue)};
      },
    }
  }
  return onWrite(change, context);
};

exports.increment = functions.firestore
    .document('counters/{counterId}')
    .onWrite(onWriteWithParsingHack);
