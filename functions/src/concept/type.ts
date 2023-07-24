import { AgentIdentifier } from "../agents/type";

// == Concept ===================================================================
export type ConceptIdentifier = string /*alias*/;
export type ConceptEmbedding = number[] /*alias*/;

type Concept = {
  name: string;
  description: string;
  embedding: ConceptEmbedding;
};

// == Request ===================================================================
export type ConceptDescriptionStorageRequest = {
  agentId: AgentIdentifier /*the agent that the concept belongs to*/;
  concepts: Concept[];
};
