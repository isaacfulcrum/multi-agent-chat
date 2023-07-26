import { ChatCompletionRequestMessage } from "openai";

import { logServiceInstance } from "@/log/service";
import { agentServiceInstance } from "@/agent/service";

import { MentalModelAgent } from "./agent";
import { conceptDescriptionStore } from "./callable";
import {
  Concept,
  ConceptFunctions,
  ConceptWithEmbedding,
  ConceptWithScore,
  extractInformation,
  scoringFunctions,
} from "./type";
import { OpenAIService } from "@/openai/service";

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
    const prompt = `Your task is to score concepts based on how relevant they are the Agent's description. 
    You can give them a score between 0 and 1 where 0 is not relevant at all and 1 is very relevant. 
    Relevant concepts are those that are important to the agent's main task. 
      You can apply the following methodology to score the concepts:
      1. Understand what does an agent do. What is their main task?
      2. Read iteratively through the concepts, as many times as necessary to understand them. 
      3. For each concept ask yourself: How relevant is this concept to the agent's main task?`;

    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: `
        AGENT DESCRIPTION: You are a Graphic Designer that has worked in UI/UX design for the last 10 years. You'll be working on a new project for a client that is a big fan of Star Wars.

        CONCEPTS
        Weather: The state of the atmosphere at a place and time as regards heat, dryness, sunshine, wind, rain, etc.
        Computer: An electronic device for storing and processing data, typically in binary form, according to instructions given to it in a variable program.
        Software: The programs and other operating information used by a computer.
        Star wars: A series of science fiction movies by George Lucas.
        Design patterns: A general, reusable solution to a commonly occurring problem within a given context in software design.
        Greek mythology: The body of myths originally told by the ancient Greeks.
        UI/UX: User interface and user experience.
        Quantum physics: The branch of physics concerned with quantum theory.
        `,
      },
      {
        role: "function",
        name: ConceptFunctions.conceptScoring,
        content: JSON.stringify({
          info: [
            { name: "Weather", score: 0.1 },
            { name: "Greek mythology", score: 0.1 },
            { name: "Quantum physics", score: 0.1 },
            { name: "Computer", score: 0.6 },
            { name: "Design patterns", score: 0.5 },
            { name: "Software", score: 0.5 },
            { name: "Star wars", score: 1 },
            { name: "UI/UX", score: 1 },
          ],
        }),
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
            { name: "Weather", score: 0.1 },
            { name: "React", score: 0.1 },
            { name: "Alien", score: 0.1 },
            { name: "Brain", score: 0.9 },
            { name: "Dopamine", score: 0.9 },
            { name: "People", score: 0.6 },
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
      console.log("Completion: ", functionCall.arguments);
      const args = JSON.parse(functionCall.arguments);
      return args.info as ConceptWithScore[];
    } else {
      throw new Error("No function call arguments");
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

      const scored = await this.scoreConcepts(activeAgent.description, concepts);
      console.log("Scored: ", scored);

      this.sendInfoLog("Concepts found: " + concepts.map((concept) => concept.name).join("\n"));

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
