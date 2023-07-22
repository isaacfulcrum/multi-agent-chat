import { AgentIdentifier } from "../agents/type";

// == Concept ===================================================================
type ConceptIdentifier = string /*alias*/;
type BaseConcept = {
  name: string;
  description: string;
};

type KnownConcept = BaseConcept & {
  conceptId: ConceptIdentifier; /*the existing id of the concept in the database*/
};

export type Concept = BaseConcept | KnownConcept;

// == Request ===================================================================
export type ConceptDescriptionStorageRequest = {
  agentId: AgentIdentifier; /*the agent that the concept belongs to*/
  concepts: Concept[];
};

// == Util ======================================================================
export const isKnownConcept = (concept: Concept): concept is KnownConcept => {
  return (concept as KnownConcept).conceptId !== undefined;
};
