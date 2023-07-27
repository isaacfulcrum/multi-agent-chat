import { onCall } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { CollectionId } from "./type";
import { conceptDescriptionStore, updateConcept } from "./concept";

import { createAgent, getAgents } from "./agents/functions";
import { queryConceptVector, storeConceptVectors } from "./pinecone/functions";

// ****************************************************************************
initializeApp();

/** Stores the given concepts in the database */
exports.conceptDescriptionStore = conceptDescriptionStore;
exports.onUpdateConcept = updateConcept;

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
exports.storeConceptVectors = storeConceptVectors;
exports.queryConceptVector = queryConceptVector;
