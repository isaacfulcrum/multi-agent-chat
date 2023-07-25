import { ChatCompletionRequestMessage } from "openai";

import { openAIEmbedding } from "@/chat/api";
import { logServiceInstance } from "@/log/service";
import { agentServiceInstance } from "@/agent/service";

import { MentalModelAgent } from "./agent";
import { conceptDescriptionStore } from "./callable";
import { Concept, ConceptWithEmbedding, extractInformation } from "./type";

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

      // Format the concepts with their respective embeddings
      const formattedConcepts = await Promise.all(
        concepts.map(async (concept) => this.getEmbeddingFromConcept(concept))
      );

      // Remove null
      const filteredConcepts = formattedConcepts.filter((concept) => concept !== null) as ConceptWithEmbedding[];

      // Store the concepts in Firebase
      const response = await conceptDescriptionStore({
        agentId: activeAgent.id,
        concepts: filteredConcepts,
      });
    } catch (error) {
      console.error("Error creating memories: ", error);
    }
  }
}
