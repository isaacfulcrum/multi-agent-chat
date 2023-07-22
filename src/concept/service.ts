import { ChatCompletionRequestMessage } from "openai";

import { openAIEmbedding } from "@/chat/api";
import { logServiceInstance } from "@/log/service";
import { agentServiceInstance } from "@/agent/service";
import { PineconeService } from "@/pinecone/service";

import { MentalModelAgent } from "./agent";
import { conceptDescriptionStore } from "./callable";
import { Concept, ConceptIdentifier, ConceptWithEmbedding, extractInformation } from "./type";

// ****************************************************************************
/** Monitors the current coversation to store key information in memory. */
export class ConceptService {
  constructor() {
    /*nothing yet*/
  }

  // == Logs ======================================================================
  sendInfoLog = (message: string) => logServiceInstance.infoLog(message, "ConceptService");

  // == Classification ============================================================
  /** Gets a vector representation of the given concept */
  public async getEmbeddingFromConcept(concept: Concept): Promise<ConceptWithEmbedding | null /*error*/> {
    try {
      const prompt = `${concept.name}: ${concept.description}`;
      const response = await openAIEmbedding(prompt);
      return {
        ...concept,
        embedding: response.data[0].embedding,
      };
    } catch (error) {
      console.error("Error getting embedding: ", error);
      return null;
    }
  }

  /** Returns a query to the vector database for the given concept */
  public async queryConcept(agentId: string, concept: Concept) {
    try {
      const conceptEmbedding = await this.getEmbeddingFromConcept(concept);
      if (!conceptEmbedding) throw new Error("No concept returned from embedding");

      return PineconeService.getInstance().queryConcept(agentId, conceptEmbedding.embedding);
    } catch (error) {
      console.error("Error getting embedding: ", error);
    }
  }

  /** Returns the same array of concepts, but if the concept is known,
   * it will have its respective {@link ConceptIdentifier} */
  public classifyConcepts = async (agentId: string, concepts: Concept[]) => {
    try {
      // Query the database for each concept
      const queryConcept = async (concept: Concept) =>
        this.queryConcept(agentId, concept).then((evaluation) => ({ concept, evaluation }));
      const conceptQueries = await Promise.all(concepts.map(queryConcept));

      // Evaluate the distance between the query and the concept
      const classified = conceptQueries.map(({ concept, evaluation }) => {
        console.log("Concept: ", concept);
        console.log("Evaluation: ", evaluation);
        // TODO: Make the actual classification

        return concept;
      });

      return classified;
    } catch (error) {
      console.error("Error getting embedding: ", error);
    }
  };

  // == Extraction ================================================================
  /** Creates a new set of memories based on the given message history */
  public async extractConcepts(messageHistory: ChatCompletionRequestMessage[]) {
    try {
      const activeAgent = agentServiceInstance.getSelectedAgent();
      if (!activeAgent) {
        this.sendInfoLog("No active agent selected");
        return;
      }
      /* Format the conversation to be sent to the memory agent */
      // TODO: This should take into account the context window
      const conversation = messageHistory.map((message) => `${message.name}: ${message.content}`).join("\n");
      const prompt = "Extract the key concepts of the next conversation. Conversation: " + conversation;
      const concepts = await extractInformation({ prompt, agentDescription: MentalModelAgent });
      if (!concepts) throw new Error("No concepts found");

      // Classify the concepts
      const classifiedConcepts = await this.classifyConcepts(activeAgent.id, concepts);
      if (!classifiedConcepts) throw new Error("No concepts returned from classification");

      // Store the concepts in Firebase
      const response = await conceptDescriptionStore({ agentId: activeAgent.id, concepts: classifiedConcepts });

      // Store the concepts in Pinecone
      // TODO: Rethink how to store the concepts in Pinecone
    } catch (error) {
      console.error("Error creating memories: ", error);
    }
  }
}
