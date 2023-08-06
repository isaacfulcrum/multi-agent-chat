import { ChatCompletionFunctions } from "openai";

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
export const conceptExtractionFunctions: ChatCompletionFunctions[] = [
  {
    name: ConceptFunctions.informationExtraction,
    description: `Extracts the key concepts from a conversation.`,
    parameters: {
      type: "object",
      properties: {
        info: {
          description: "The key concepts extracted from the conversation. No more than 10 concepts.",
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

export const conceptScoringFunctions: ChatCompletionFunctions[] = [
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
