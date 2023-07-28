import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import { Timestamp, getFirestore } from "firebase-admin/firestore";

import { Concept, ConceptDescriptionStorageRequest, ConceptIdentifier, DatabaseConcept } from "./type";
import { CollectionId } from "../type";
import { queryConceptVector, storeConceptVectors } from "../pinecone/functions";
import { ConceptVector, QueryConceptRequest, conceptToVectorConcept } from "../pinecone/type";
import { OpenAIService } from "../openai/service";

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
      // Query vector database for the concept
      const conceptId = await isKnownConcept({ agentId, conceptEmbedding: concept.embedding });
      let conceptDoc;
      if (conceptId) {
        conceptDoc = agentConceptCollection.doc(conceptId); /* Use the same document */
      } else {
        conceptDoc = agentConceptCollection.doc();
        batch.set(conceptDoc, {
          name: concept.name,
          description: concept.description,
          score: concept.score,
          lastUpdate: Timestamp.now().toMillis(),
        });
      }

      const descriptionDoc = conceptDoc.collection(CollectionId.Descriptions).doc();
      const conceptDescription = {
        name: concept.name,
        description: concept.description,
        score: concept.score,
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
    if (score < 0.92) return null; /* For now this works the best */

    return match?.id;
  } catch (error) {
    console.log("ConceptService.isKnownConcept error", error);
    return null;
  }
};

/** When a new entry is added to the history of a concept, update the
 * name, description and score of the concept */
export const onConceptCreated = onDocumentCreated(
  `${CollectionId.Agents}/{agentId}/${CollectionId.Concepts}/{conceptId}/${CollectionId.Descriptions}/{entryId}`,

  async (event) => {
    const { agentId, conceptId } = event.params;

    const conceptDoc = getFirestore()
      .collection(CollectionId.Agents)
      .doc(agentId)
      .collection(CollectionId.Concepts)
      .doc(conceptId);

    const descriptions = await conceptDoc.collection(CollectionId.Descriptions).get();
    const conceptHistory = descriptions.docs.map((doc) => doc.data()) as DatabaseConcept[];

    if (conceptHistory.length <= 1) return;

    const averageScore = conceptHistory.reduce((acc, curr) => acc + curr.score, 0) / conceptHistory.length || 0;
    const summary = await getSummary(conceptHistory);

    return conceptDoc.update({
      name: summary.name,
      description: summary.description,
      score: averageScore,
      lastUpdate: Timestamp.now().toMillis(),
    });
  }
);

/** Gets the summary of a lot of a list of the same concept */
export const getSummary = async (
  descriptions: DatabaseConcept[]
): Promise<{
  name: string;
  description: string;
}> => {
  const completion = await OpenAIService.getInstance().chatCompletion({
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that summarizes concepts for the user. You will be given a list of concepts and their descriptions. 
        They'll all be highly related to each other. Your job is to summarize all of this concepts into one. 
        Keep it simple, but don't leave out any important details. At most 100 word will suffice. Don't input any information that is not in the descriptions.

        Example:
        
        Descriptions: 
        1. A website is a collection of web pages and related content that is identified by a common domain name and published on at least one web server.
        2. Notable examples are wikipedia.org, google.com, and amazon.com.

        Output: {
          name: "Website",
          summary: "A collection of web pages and related content that is identified by a common domain name and published on at least one web server. Notable examples are wikipedia.org, google.com, and amazon.com."
        }
        `,
      },
      {
        role: "user",
        content: `Concept: ${descriptions[0].name}  
        Descriptions:
        ${descriptions.map((d, i) => `${i + 1}. ${d.description}`).join("\n")}
        `,
      },
    ],
    function_call: {
      name: "summarize",
    },
    functions: [
      {
        name: "summarize",
        description: `Given a concept and it's descriptions, the next message will be a summary of the concept.`,
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the concept e.g: Website",
            },
            description: {
              type: "string",
              description:
                "The summary of the concept e.g: A website is a collection of web pages and related content that is identified by a common domain name and published on at least one web server.",
            },
          },
          required: ["name, description"],
        },
      },
    ],
  });
  if (!completion) throw new Error("No completion returned");

  const functionCall = completion.choices[0].message?.function_call;
  if (functionCall && functionCall.arguments) {
    const args = JSON.parse(functionCall.arguments) as {
      name: string;
      description: string;
    };

    console.log("args", args);
    return args;
  } else {
    throw new Error("No function call arguments");
  }
};
