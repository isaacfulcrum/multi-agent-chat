import { ConceptEmbedding, ConceptWithEmbedding } from "../concept/type";

export const IndexIdentifier = "agent-concepts"; /*the only index we have right now*/

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
  conceptEmbedding: ConceptEmbedding /*the concepts to store*/;
};

// == Util ======================================================================

export const conceptToVectorConcept = (conceptId: ConceptVectorIdentifier, concept: ConceptWithEmbedding): ConceptVector => {
  return {
    id: conceptId,
    values: concept.embedding,
    metadata: {
      name: concept.name,
      description: concept.description,
    },
  };
};
