import { onCall } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { Timestamp, getFirestore } from "firebase-admin/firestore";

import { CollectionId, Concept, ConceptStoreRequest } from "./type";

// ****************************************************************************
initializeApp();

/** Stores the given concepts in the database */
exports.storeMemories = onCall<ConceptStoreRequest[]>(async (request) => {
  const conceptsToStore = request.data;

  const batch = getFirestore().batch();
  conceptsToStore.forEach((concept) => {
    let conceptDoc;
    if (concept.documentId) {
      conceptDoc = getFirestore().collection(CollectionId.Memories).doc(concept.documentId);
    } else {
      conceptDoc = getFirestore().collection(CollectionId.Memories).doc();
      batch.set(conceptDoc, { name: concept.name }); // Add the name of the memory
    }

    const newDoc = conceptDoc.collection(CollectionId.Concepts).doc();
    const newConcept: Concept = {
      name: concept.name,
      description: concept.description,
      timestamp: Timestamp.now().toMillis(),
    };
    batch.set(newDoc, newConcept);
  });
  await batch.commit();
  // Push the new message into Firestore using the Firebase Admin SDK.
  return { result: "Success" };
});

exports.getMemories = onCall(async (request) => {
  const memories = await getFirestore().collection(CollectionId.Memories).get();
  
  // Bring the first concept of each memory ordered by timestamp
  const querys = memories.docs.map((memory) =>
  getFirestore()
  .collection(`${CollectionId.Memories}/${memory.id}/${CollectionId.Concepts}`)
  .orderBy("timestamp")
  .limit(1)
  .get()
  );
  
  const querysResults = await Promise.all(querys);
  const result = querysResults.map((query) => query.docs.map((doc) => doc.data())).flat();
  
  
  return { result };
});
