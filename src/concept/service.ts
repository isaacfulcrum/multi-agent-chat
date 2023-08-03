import { ChatCompletionRequestMessage } from "openai";

import { logServiceInstance } from "@/log/service";
import { OpenAIService } from "@/openai/service";
import { AgentSpecs } from "@/agent/type";

import { MentalModelAgent, ScoringAgent } from "./prompt";
import { conceptDescriptionStore } from "./callable";
import { Concept, ConceptFunctions, ConceptWithEmbedding, ConceptWithScore, extractInformation, scoringFunctions } from "./type";

// ****************************************************************************
/** Monitors the current coversation to store key information in memory. */
export class ConceptService {
  constructor() {
    /*nothing yet*/
  }

  // == Logs ======================================================================
  private sendInfoLog(message: string) {
    logServiceInstance.infoLog(message, "ConceptService");
  }

  // == Classification ============================================================
  /** Gets a vector representation of the given concept */
  private async getEmbeddingFromConcept(concept: Concept): Promise<ConceptWithEmbedding | null /*error*/> {
    try {
      const input = `${concept.name}: ${concept.description}`;
      const response = await OpenAIService.getInstance().getEmbedding({ input });
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
  private async scoreConcepts(agentDescription: string, concepts: Concept[]): Promise<ConceptWithScore[]> {
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: ScoringAgent,
      },
      {
        role: "user",
        content: `
        AGENT DESCRIPTION: You are a Science professor that has worked at the University of Oxford in the last 10 years. You are an expert in the field of neuroscience and have published several papers in the field.

        CONCEPTS
        Weather: The state of the atmosphere at a place and time as regards heat, dryness, sunshine, wind, rain, etc.
        Brain: An organ of soft nervous tissue contained in the skull of vertebrates, functioning as the coordinating center of sensation and intellectual and nervous activity.
        Dopamine: A compound present in the body as a neurotransmitter and a precursor of other substances including epinephrine.
        React: A JavaScript library for building user interfaces.
        Alien: A hypothetical or fictional being from another world.
        People: Human beings in general or considered collectively.
        `,
      },
      {
        role: "function",
        name: ConceptFunctions.conceptScoring,
        content: JSON.stringify({
          info: [
            { name: "Weather", score: 0.0 },
            { name: "React", score: 0.0 },
            { name: "Alien", score: 0.0 },
            { name: "Brain", score: 1.0 },
            { name: "Dopamine", score: 1.0 },
            { name: "People", score: 0.5 },
          ],
        }),
      },
      {
        role: "user",
        content: `
        AGENT DESCRIPTION: ${agentDescription}
        CONCEPTS
        ${concepts.map((concept) => `${concept.name}: ${concept.description}`).join("\n")}`,
      },
    ];
    const completion = await OpenAIService.getInstance().chatCompletion({
      messages,
      functions: scoringFunctions,
      function_call: {
        name: ConceptFunctions.conceptScoring,
      },
      max_tokens: 1000,
      temperature: 0.2,
    });

    if (!completion) throw new Error("No completion found");
    const functionCall = completion.choices[0].message?.function_call;

    if (functionCall && functionCall.arguments) {
      const args = JSON.parse(functionCall.arguments);
      const scores = args.info as ConceptWithScore[];

      // Merge the scores with the concepts
      return concepts.map((concept) => {
        const conceptWithScore = scores.find((score) => score.name === concept.name); /*search by name*/
        return {
          ...concept,
          score: conceptWithScore ? conceptWithScore.score : 0,
        };
      });
    } else {
      throw new Error("No function call arguments");
    }
  }

  // == Extraction ================================================================
  /** Creates a new set of memories based on the given message history */
  public async extractConcepts(messageHistory: ChatCompletionRequestMessage[], agentSpecs: AgentSpecs) {
    try {
      /* Format the conversation to be sent to the memory agent */
      const conversation = messageHistory.map((message) => `${message.name}: ${message.content}`).join("\n");
      const prompt =
        `Extract the key concepts of the next conversation. 
         Limit yourself to the more important concepts, no more than 10 are required. 
         Try extracting concepts you as an LLM don't know about.
         Conversation: ` + conversation;
      const concepts = await extractInformation({ prompt, agentDescription: MentalModelAgent });
      if (!concepts) throw new Error("No concepts found");
      this.sendInfoLog("Concepts found: \n" + concepts.map((concept) => concept.name).join("\n"));

      const scored = await this.scoreConcepts(agentSpecs.description, concepts);
      this.sendInfoLog("Scored concepts by relevancy: \n" + scored.map((concept) => `${concept.name}: ${concept.score}`).join("\n"));

      // Format the concepts with their respective embeddings
      const formattedConcepts = await Promise.all(scored.map(async (concept) => this.getEmbeddingFromConcept(concept)));

      // Remove null
      const filteredConcepts = formattedConcepts.filter((concept) => concept !== null) as ConceptWithEmbedding[];

      // Store the concepts in Firebase
      const response = await conceptDescriptionStore({
        agentId: agentSpecs.id,
        concepts: filteredConcepts,
      });
    } catch (error) {
      console.error("Error creating memories: ", error);
    }
  }
}
