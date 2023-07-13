import { ChatCompletionRequestMessage } from "openai";

import { openAIEmbedding } from "@/chat/api";
import { calculateDistance } from "@/utils/vector";

import { Concept, extractInformation } from "./type";
import { getConcepts, setConcepts } from "./callable";
import { MentalModelAgent } from "./agent";

// ****************************************************************************
/** Monitors the current coversation to store key information in memory. */
export class MemoryAgentService {
  constructor() {
    /*nothing yet*/
  }
  // == Concept Extraction ======================================================================
  /** Gets a vector representation of the given concept */
  public async getEmbedding(concept: Concept) {
    try {
      const prompt = `${concept.name}: ${concept.description}`;
      const response = await openAIEmbedding(prompt);
      return response.data[0].embedding;
    } catch (error) {
      console.error("Error getting embedding: ", error);
    }
  }
  
  /** Merges a given list of concepts with the existing one on the database */
  public async mergeConcepts(concepts: Concept[]) {
    try {
      const archivedConcepts = (await getConcepts()) as Concept[];
      if (!archivedConcepts) throw new Error("No concepts found");

      const getConceptEmbedding = async (concept: Concept) => this.getEmbedding(concept).then((embedding) => ({ concept, embedding }));
      const archivedEmbeddings = await Promise.all(archivedConcepts.map(getConceptEmbedding));
      const newConceptEmbeddings = await Promise.all(concepts.map(getConceptEmbedding));

      // TODO: Make a type
      const conceptsToMerge: {
        archivedConcept: Concept;
        newConcept: Concept;
      }[] = [];

      /* Compare the new concepts with the archived ones */
      newConceptEmbeddings.forEach((newC) => {
        archivedEmbeddings.forEach((archived) => {
          const distance = calculateDistance(newC.embedding ?? [], archived.embedding ?? []);
          if (distance < 0.5) {
            conceptsToMerge.push({ archivedConcept: newC.concept, newConcept: archived.concept });
          }
        });
      });

      const prompt =
        "Extract a summarized version of each pair of concepts, don't define two concepts with the same name: " +
        conceptsToMerge.map(
          (c) => `
      == Pair =======================================================================
      OLD: ${c.archivedConcept.name}: ${c.archivedConcept.description}
      NEW: ${c.newConcept.name}: ${c.newConcept.description}`
        );

      //TODO: Take into account the new concepts
      return extractInformation({ prompt, agentDescription: MentalModelAgent });
    } catch (error) {
      console.error("Error merging concepts: ", error);
    }
  }

  // == Memory ======================================================================
  /** Creates a new set of memories based on the given message history */
  public async createMemories(messageHistory: ChatCompletionRequestMessage[]) {
    try {
      /* Format the conversation to be sent to the memory agent */
      const conversation = messageHistory.map((message) => `${message.name}: ${message.content}`).join("\n");
      const prompt = "Extract the key concepts of the next conversation. Conversation: " + conversation;

      const concepts = await extractInformation({ prompt, agentDescription: MentalModelAgent });
      if (!concepts) throw new Error("No concepts found");

      const merged = await this.mergeConcepts(concepts);
      if (!merged) throw new Error("No concepts returned from merge");

      console.log("New concepts: ", merged);
      await setConcepts(merged);
    } catch (error) {
      console.error("Error creating memories: ", error);
    }
  }
}
