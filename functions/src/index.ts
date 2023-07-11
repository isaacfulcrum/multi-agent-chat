import { onCall } from "firebase-functions/v2/https";

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

initializeApp();

exports.storeMemories = onCall<{ [key: string]: string }>(async (request) => {
  // Grab the text parameter.
  const memories = request.data;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const concepts = getFirestore().doc("memories/concepts"); /* Create a new document reference */
  concepts.update({
    ...memories,
  });
});

exports.getMemories = onCall(async (request) => {
  const memories = await getFirestore().doc("memories/concepts").get();
  return memories.data();
});
