/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall } from "firebase-functions/v2/https";

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

initializeApp();

exports.addMessage = onCall(async (request) => {
  // Grab the text parameter.
  const original = request.data.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await getFirestore().collection("messages").add({ original: original });
  // Send back a message that we've successfully written the message
  return { result: `Message with ID: ${writeResult.id} added.` };
});

exports.getMessages = onCall(async (request) => {
  const messages = await getFirestore().collection("messages").get();
  return { messages: messages.docs.map((doc) => doc.data()) };
});
