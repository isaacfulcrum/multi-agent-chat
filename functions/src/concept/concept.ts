import { onCall } from "firebase-functions/v2/https";
import { Timestamp, getFirestore } from "firebase-admin/firestore";

import { ConceptDescriptionStorageRequest, ConceptIdentifier } from "./type";
import { CollectionId } from "../type";
import { queryConceptVector, storeConceptVectors } from "../pinecone/functions";
import { ConceptVector, QueryConceptRequest, conceptToVectorConcept } from "../pinecone/type";

/** Stores the description of the {@link Concept}s for the given agent */
export const conceptDescriptionStore = onCall<ConceptDescriptionStorageRequest>(async (request) => {
  const { agentId, concepts } = request.data;

  const agentConceptCollection = getFirestore()
    .collection(CollectionId.Agents)
    .doc(agentId)
    .collection(CollectionId.Concepts); /* Get the collection of concepts for the agent */

  const batch = getFirestore().batch();
  const vectorConcepts: ConceptVector[] = [];

  await Promise.all(
    concepts.map(async (concept) => {
      console.log("ConceptService.conceptDescriptionStore concept", concept);
      // Query vector database for the concept
      const conceptId = await isKnownConcept({ agentId, conceptEmbedding: concept.embedding });
      let conceptDoc;
      if (conceptId) {
        conceptDoc = agentConceptCollection.doc(conceptId); /* Use the same document */
      } else {
        conceptDoc = agentConceptCollection.doc();
      }
      batch.set(conceptDoc, {
        name: concept.name,
        description: concept.description /*TODO: this must be a summary of all descriptions */,
      });
      const descriptionDoc = conceptDoc.collection(CollectionId.Descriptions).doc();
      const conceptDescription = {
        description: concept.description,
        timestamp: Timestamp.now().toMillis(),
      };
      batch.set(descriptionDoc, conceptDescription);
      vectorConcepts.push(conceptToVectorConcept(conceptDoc.id, concept));
    })
  );
  await batch.commit();

  // Store the concepts in the vector database
  await storeConceptVectors({
    agentId,
    concepts: vectorConcepts,
  });

  return { result: "Success" };
});

/** Check for the existence of the concept with it's embedding */
const isKnownConcept = async (args: QueryConceptRequest): Promise<ConceptIdentifier | null /*not found*/> => {
  try {
    const query = await queryConceptVector(args);
    if (!query.matches?.length) return null /*not found*/;

    const match = query.matches[0];

    const score = match?.score;
    // distance between embeddings
    if (!score) return null;
    if (score < 0.90) return null; /* For now this works the best */

    return match?.id;
  } catch (error) {
    console.log("ConceptService.isKnownConcept error", error);
    return null;
  }
};
