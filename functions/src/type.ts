export enum CollectionId {
  Memories = "memories",
  Concepts = "concepts",
}

export type Concept = {
  name: string;
  description: string;
  timestamp: number;
};

export type ConceptStoreRequest = {
  documentId?: string;
  name: string;
  description: string;
};
