import { onCall } from "firebase-functions/v2/https";

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

initializeApp();

exports.storeMemories = onCall<
  {
    name: string;
    description: string;
  }[]
>(async (request) => {
  // Grab the text parameter.
  const memories = request.data;

  const batch = getFirestore().batch();
  memories.forEach((memory) => {
    // Subcollection of concepts
    const conceptDoc = getFirestore().collection("memories").doc(memory.name);
    batch.set(conceptDoc, memory);
    const subcollection = conceptDoc.collection("concepts").doc(); // new concept
    batch.set(subcollection, memory);
  });
  await batch.commit();
  // Push the new message into Firestore using the Firebase Admin SDK.
  return { result: "Success" };
});

exports.getMemories = onCall(async (request) => {
  const memories = await getFirestore().collection("memories").get();
  const result = memories.docs.map((memory) => memory.data());
  return { result };
});
