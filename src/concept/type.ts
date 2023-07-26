import { ChatCompletionFunctions, ChatCompletionRequestMessage } from "openai";

import { ChatMessageRole } from "@/chat/type";
import { OpenAIService } from "@/openai/service";

// ****************************************************************************
// == Concept ===================================================================
export type ConceptIdentifier = string /*alias*/;
type BaseConcept = {
  name: string;
  description: string;
};

type withEmbedding = {
  embedding: number[];
};

type withScore = {
  score: number;
};

export type ConceptWithEmbedding = BaseConcept & withEmbedding;
export type ConceptWithScore = BaseConcept & withScore;
export type CompleteConcept = BaseConcept & withEmbedding & withScore;

export type Concept = BaseConcept | ConceptWithEmbedding | ConceptWithScore | CompleteConcept;

// == Request ===================================================================
export type ConceptDescriptionStorageRequest = {
  agentId: string /*the agent that the concept belongs to*/;
  concepts: ConceptWithEmbedding[];
};

// == Functions ===================================================================
export enum ConceptFunctions {
  informationExtraction = "informationExtraction",
  conceptScoring = "conceptScoring",
}
export const functions: ChatCompletionFunctions[] = [
  {
    name: ConceptFunctions.informationExtraction,
    description: `Extracts the key concepts from a conversation.`,
    parameters: {
      type: "object",
      properties: {
        info: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Title of the concept" },
              description: { type: "string", description: "Description of the concept" },
            },
            required: ["name", "description"],
          },
        },
      },
      required: ["info"],
    },
  },
];

export const scoringFunctions: ChatCompletionFunctions[] = [
  {
    name: ConceptFunctions.conceptScoring,
    description: `Scores the given concepts based on how relevant they are to the agent's description.`,
    parameters: {
      type: "object",
      properties: {
        info: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Title of the concept" },
              score: { type: "number", description: "Score of the concept" },
            },
            required: ["name", "score"],
          },
        },
      },
      required: ["info"],
    },
  },
];

// == Util ======================================================================
type ExtractInformationArgs = {
  prompt: string;
  agentDescription?: string;
};

/** Returns a list of arguments of key concepts given a prompt
 *  @param prompt This promt should include information to extract concepts from and clear instructions on how to do so.
 *  @param agentDescription This is the description of the agent that will be used to extract information */
export const extractInformation = async ({
  prompt,
  agentDescription,
}: ExtractInformationArgs): Promise<Concept[] | undefined /*no response*/> => {
  const instruction = {
    role: ChatMessageRole.User,
    content: prompt,
    name: "user",
  };
  const messages: ChatCompletionRequestMessage[] = [instruction];

  if (agentDescription) {
    const systemMessage = {
      role: ChatMessageRole.System,
      content: agentDescription,
    };
    messages.unshift(systemMessage);
  }

  try {
    const completion = await OpenAIService.getInstance().chatCompletion({
      messages,
      functions,
      function_call: {
        name: ConceptFunctions.informationExtraction,
      },
      max_tokens: 1000,
    });
    if (!completion) throw new Error("No completion returned");

    const functionCall = completion.choices[0].message?.function_call;
    if (functionCall && functionCall.arguments) {
      const args = JSON.parse(functionCall.arguments);
      return args.info;
    } else {
      throw new Error("No function call arguments");
    }
  } catch (error) {
    console.error("Error extracting information: ", error);
  }
};
