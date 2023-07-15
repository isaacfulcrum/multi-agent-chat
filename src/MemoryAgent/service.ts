import { ChatCompletionRequestMessage } from "openai";

import { openAIEmbedding } from "@/chat/api";
import { calculateDistance } from "@/utils/vector";

import { Concept, DatabaseConcept, extractInformation } from "./type";
import { getConcepts, setConcepts } from "./callable";
import { MentalModelAgent } from "./agent";
import { BehaviorSubject } from "rxjs";

// ****************************************************************************
/** Monitors the current coversation to store key information in memory. */
export class MemoryAgentService {

  // /** logs rendered on the ui */
  private logs$ = new BehaviorSubject<string[]>([]);
  public onLog$ = () => this.logs$

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
  public async mergeConcepts(extractedConcepts: Concept[]) {
    try {
      const archivedConcepts = (await getConcepts()) as DatabaseConcept[];
      if (archivedConcepts.length === 0) return extractedConcepts;

      // FIXME: Get the embedding for each concept more efficiently, maybe a vector database?
      const getConceptEmbedding = async (concept: Concept) =>
        this.getEmbedding(concept).then((embedding) => ({ ...concept, embedding }));

      const evaluatedArchivedConcepts = await Promise.all(archivedConcepts.map(getConceptEmbedding)) as DatabaseConcept[]; 
      const evaluatedExtractedConcepts = await Promise.all(extractedConcepts.map(getConceptEmbedding)) as Concept[];

      const newConcepts: Concept[] = [];
      /* Compare the new concepts with the archived ones */
      // NOTE: For now this is an O(n^2) operation, with time the number of concepts will increase and this can become a problem
      evaluatedExtractedConcepts.forEach((extracted) => {
        let isNewConcept = true;
        evaluatedArchivedConcepts.forEach((archived) => {
          const distance = calculateDistance(extracted.embedding ?? [], archived.embedding ?? []);
          if (distance < 0.1) isNewConcept = false; /* Most likely the same concept, skip it */
          else if (distance >= 0.1 && distance < 0.4) {
            isNewConcept = false;
            newConcepts.push({
              documentId: archived.documentId /* Keep the same document id */,
              ...extracted,
            });
          }
        });
        if (isNewConcept) {
          /* No match found, add it to the list of new concepts */
          newConcepts.push(extracted);
        }
      });
      return newConcepts;
    } catch (error) {
      console.error("Error merging concepts: ", error);
    }
  }

  // CHECK: Is memory a good name for this?
  // == Memory ======================================================================
  /** Creates a new set of memories based on the given message history */
  public async createMemories(messageHistory: ChatCompletionRequestMessage[]) {
    try {
      /* Format the conversation to be sent to the memory agent */
      // TODO: This should take into account the context window
      const conversation = messageHistory.map((message) => `${message.name}: ${message.content}`).join("\n");
      const prompt = "Extract the key concepts of the next conversation. Conversation: " + conversation;

      const concepts = await extractInformation({ prompt, agentDescription: MentalModelAgent });
      if (!concepts) throw new Error("No concepts found");

      const merged = await this.mergeConcepts(concepts);
      if (!merged) throw new Error("No concepts returned from merge");

      await setConcepts(merged);
    } catch (error) {
      console.error("Error creating memories: ", error);
    }
  }
}
