import { AgentIdentifier } from "../agents/type";

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

type withTimestamp = {
  timestamp: number;
};

export type ConceptWithEmbedding = BaseConcept & withEmbedding;
export type ConceptWithScore = BaseConcept & withScore;
export type CompleteConcept = BaseConcept & withEmbedding & withScore;
export type DatabaseConcept = BaseConcept & withScore & withTimestamp;

export type Concept = BaseConcept | ConceptWithEmbedding | ConceptWithScore | CompleteConcept;

// == Request ===================================================================
export type ConceptDescriptionStorageRequest = {
  agentId: AgentIdentifier /*the agent that the concept belongs to*/;
  concepts: CompleteConcept[];
};
