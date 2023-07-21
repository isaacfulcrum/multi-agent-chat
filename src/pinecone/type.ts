// == Vector ====================================================================
type ConceptVectorIdentifier = string /*alias*/;
export type ConceptVector = {
  id: ConceptVectorIdentifier;
  values: number[] /*embedding*/;
  metadata: {
    name: string;
    description: string /*summary*/;
  };
};

// == Concept ===================================================================
export type ConceptVectorStoreRequest = {
  agentId: string /*the agent that the concept belongs to*/;
  concepts: ConceptVector[] /*the concepts to store*/;
};

export type QueryConceptRequest = {
  agentId: string /*the agent that the concept belongs to*/;
  conceptEmbedding: number[] /*the concepts to store*/;
};