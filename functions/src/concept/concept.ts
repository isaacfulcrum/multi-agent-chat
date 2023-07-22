import { onCall } from "firebase-functions/v2/https";
import { Timestamp, getFirestore } from "firebase-admin/firestore";

import { ConceptDescriptionStorageRequest, isKnownConcept, Concept } from "./type";
import { CollectionId } from "../type";

/** Stores the description of the {@link Concept}s for the given agent */
export const conceptDescriptionStore = onCall<ConceptDescriptionStorageRequest>(async (request) => {
  const { agentId, concepts } = request.data;

  const agentConceptCollection = getFirestore()
    .collection(CollectionId.Agents)
    .doc(agentId)
    .collection(CollectionId.Concepts); /* Get the collection of concepts for the agent */

  const batch = getFirestore().batch();
  concepts.forEach((concept) => {
    let conceptDoc;
    if (isKnownConcept(concept)) {
      conceptDoc = agentConceptCollection.doc(concept.conceptId); /* Use the same document */
    } else {
      conceptDoc = agentConceptCollection.doc();
      batch.set(conceptDoc, { name: concept.name }); /* Set the name of the concept */
    }

    const descriptionDoc = conceptDoc.collection(CollectionId.Descriptions).doc();
    const conceptDescription = {
      description: concept.description,
      timestamp: Timestamp.now().toMillis(),
    };
    batch.set(descriptionDoc, conceptDescription);
  });
  await batch.commit();
  return { result: "Success" };
});
