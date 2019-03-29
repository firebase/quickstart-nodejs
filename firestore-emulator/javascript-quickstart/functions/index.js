const functions = require('firebase-functions');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.increment = functions.firestore
    .document('counters/{counterId}')
    .onWrite((change, context) => {
      const count = change.after.data().value;
      if (count <= 10) {
        return change.after.ref.set({ value: count + 1 }, {merge: true});
      } else {
        return null;
      }
    });
