import { ChatCompletionRequestMessage } from "openai";

import { Concept, extractInformation } from "./type";
import { getConcepts } from "./callable";
import { MentalModelAgent } from "./agent";

// ****************************************************************************
/** Monitors the current coversation to store key information in memory. */
export class MemoryAgentService {
  constructor() {
    /*nothing yet*/
  }

  // == Memory ======================================================================
  public async mergeConcepts(concepts: Concept[]) {
    const archivedConcepts = (await getConcepts()) as Concept[];
    if (!archivedConcepts) throw new Error("No concepts found");
    console.log("Concepts: ", concepts);
    console.log("Archive: ", archivedConcepts);

    // TODO: Refine this algorithm with embeddings
    const conceptList = `OLD CONCEPTS: ${JSON.stringify(archivedConcepts)} \n\n  NEW CONCEPTS: ${JSON.stringify(concepts)}\n`;
    const prompt = "I have a new set of concepts, help me complement them with a list of old concepts I had: " + conceptList;
    return extractInformation({ prompt });
  }

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
      // TODO: Once the merge algorithm is refined, store the new concepts
      // await setConcepts(merged);
    } catch (error) {
      console.error("Error creating memories: ", error);
    }
  }
}
