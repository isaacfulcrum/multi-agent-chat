import { ChatCompletionRequestMessage } from "openai";

import { AbstractService } from "@/util/service";
import { OpenAIService } from "@/openai/service";
import { ConversationalAgentSpecs } from "@/agent/type";
import { ChatMessage } from "@/chat/type";

import { conceptDescriptionStore } from "./callable";
import { Concept, ConceptWithEmbedding, ConceptWithScore } from "./type";
import { conceptExtractionRequest, conceptScoringRequest } from "./util";

// ****************************************************************************

const openai = new OpenAIService();

/** Monitors the current coversation to store key information in memory. */
export class ConceptService extends AbstractService {
  public constructor() {
    super("Concept Service");
  }

  // == Classification ============================================================
  /** Gets a vector representation of the given concept */
  private async getEmbeddingFromConcept(concept: Concept): Promise<ConceptWithEmbedding | null /*error*/> {
    try {
      const input = `${concept.name}: ${concept.description}`;
      const response = await openai.getEmbedding({ input });
      if (!response) throw new Error("No embedding found");
      return {
        ...concept,
        embedding: response.data[0].embedding,
      };
    } catch (error) {
      console.error("Error getting embedding: ", error);
      return null;
    }
  }

  // == Scoring ===================================================================
  private async scoreConcepts(concepts: Concept[], agentDescription: string): Promise<ConceptWithScore[] | null /*error*/> {
    try {
      const scores = await conceptScoringRequest(concepts, agentDescription);
      if (!scores) throw new Error("No scores found");

      // Merge the scores with the concepts
      return concepts.map((concept) => {
        const conceptWithScore = scores.find((score) => score.name === concept.name); /*search by name*/
        return {
          ...concept,
          score: conceptWithScore ? conceptWithScore.score : 0,
        };
      });
    } catch (error) {
      console.error("Error scoring concepts: ", error);
      return null;
    }
  }

  // == Extraction ================================================================
  /** Creates a new set of memories based on the given message history */
  public async extractConcepts(messageHistory: ChatMessage[], agentSpecs: ConversationalAgentSpecs) {
    try {
      const concepts = await conceptExtractionRequest(messageHistory);
      if (!concepts) throw new Error("No concepts found");
      this.logger.log("Concepts found: \n" + concepts.map((concept) => concept.name).join("\n"), agentSpecs.color);

      const scored = await this.scoreConcepts(concepts, agentSpecs.description);
      if (!scored) throw new Error("No scored concepts found");
      this.logger.log("Scored concepts by relevancy: \n" + scored.map((concept) => `${concept.name}: ${concept.score}`).join("\n"), agentSpecs.color);

      // Format the concepts with their respective embeddings
      const formattedConcepts = await Promise.all(scored.map(async (concept) => this.getEmbeddingFromConcept(concept)));
      const filteredConcepts = formattedConcepts.filter((concept) => concept !== null) as ConceptWithEmbedding[]; /*filter out nulls*/

      // Store the concepts in Firebase
      // TODO: storing should be done from the agent
      const response = await conceptDescriptionStore({
        agentId: agentSpecs.id,
        concepts: filteredConcepts,
      });
    } catch (error) {
      console.error("Error creating memories: ", error);
    }
  }
}
