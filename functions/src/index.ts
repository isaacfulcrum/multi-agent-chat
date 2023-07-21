import { onCall } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { Timestamp, getFirestore } from "firebase-admin/firestore";

import { CollectionId, Concept, ConceptStoreRequest } from "./type";
import { createAgent, getAgents } from "./agents/functions";
import { storeVectorConcepts } from "./pinecone/functions";

// ****************************************************************************
initializeApp();

/** Stores the given concepts in the database */
exports.storeMemories = onCall<ConceptStoreRequest[]>(async (request) => {
  const conceptsToStore = request.data;

  const batch = getFirestore().batch();
  conceptsToStore.forEach((concept) => {
    let conceptDoc;
    if (concept.documentId) {
      conceptDoc = getFirestore().collection(CollectionId.Memories).doc(concept.documentId); /* Use existing document */
    } else {
      conceptDoc = getFirestore().collection(CollectionId.Memories).doc(); /* Create a new document */
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
  return { result: "Success" };
});

/** Retrieves concepts from Firestore */
exports.getMemories = onCall(async () => {
  const memories = await getFirestore().collection(CollectionId.Memories).get();
  // Get the most recent concept for each memory
  const querys = memories.docs.map((memory) =>
    getFirestore()
      .collection(`${CollectionId.Memories}/${memory.id}/${CollectionId.Concepts}`)
      .orderBy("timestamp") /* Most recent first */
      .limit(1)
      .get()
  );

  const querysResults = await Promise.all(querys);
  /* Returns the most recent concept for each memory with the Concept document id */
  const result = querysResults
    .map((query) =>
      query.docs.length ? { documentId: query.docs[0].ref.parent.parent?.id, ...query.docs[0].data() } : null
    )
    .filter((memory) => memory); /* Remove null values */

  return { result };
});

// === Agent Functions ========================================================
exports.createAgent = createAgent;
exports.getAgents = getAgents;

// === Pinecone Functions =====================================================
exports.storeVectorConcepts = storeVectorConcepts;
