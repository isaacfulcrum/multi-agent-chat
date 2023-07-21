import { onCall } from "firebase-functions/v2/https";
import { PineconeClient } from "@pinecone-database/pinecone";
import { ConceptVectorStoreRequest, IndexIdentifier, QueryConceptRequest } from "./type";

// ****************************************************************************
// == Pinecone ====================================================================
const getPinecone = async () => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT || "",
    apiKey: process.env.PINECONE_API_KEY || "",
  });
  return pinecone;
};

// == Write =====================================================================
/** store a list of concepts in the pinecone database
 * @param agentId the agent that the list of concepts belongs to
 * @param concepts the concepts to store
 */
export const storeConceptVectors = onCall<ConceptVectorStoreRequest>(async (req) => {
  try {
    const { agentId, concepts } = req.data;

    const pinecone = await getPinecone();
    const index = pinecone.Index(IndexIdentifier);

    const result = await index.upsert({
      upsertRequest: {
        vectors: concepts,
        namespace: agentId,
      },
    });
    return { result };
  } catch (error) {
    console.log("PineconeService.storeVectorConcepts error", error);
    return { result: "Error" };
  }
});

// == Read ======================================================================
/** query the pinecone database for the most similar concepts to the given concept embedding 
 * @param agentId the agent that the concept belongs to
 * @param conceptEmbedding the concept embedding to query
*/
export const queryConceptVector = onCall<QueryConceptRequest>(async (req) => {
  try {
    const { agentId, conceptEmbedding } = req.data;

    const pinecone = await getPinecone();
    const index = pinecone.Index(IndexIdentifier);

    const result = await index.query({
      queryRequest: {
        vector: conceptEmbedding,
        topK: 1,
        includeValues: true,
        namespace: agentId,
      },
    });

    return { result };
  } catch (error) {
    console.log("PineconeService.storeVectorConcepts error", error);
    return { result: "Error" };
  }
});
