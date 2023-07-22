import { queryConceptVector, storeConceptVectors } from "./callable";
import { ConceptVectorStoreRequest } from "./type";

/** Manages everything related to Pinecone vector database */
// ****************************************************************************
export class PineconeService {
  // == Singleton =================================================================
  private static singleton: PineconeService;
  public static getInstance() {
    if (!PineconeService.singleton) {
      PineconeService.singleton = new PineconeService();
    }
    return PineconeService.singleton;
  }

  // == Lifecycle =================================================================
  protected constructor() {}

  // == Write =====================================================================
  public async saveConcepts(concepts: ConceptVectorStoreRequest) {
    try {
      const response = await storeConceptVectors(concepts);
      console.log("PineconeService.create response", response);
    } catch (error) {
      console.log("PineconeService.create error", error);
    }
  }

  // == Read ======================================================================
  public async queryConcept(agentId: string, embedding: number[]) {
    try {
      return queryConceptVector({ agentId, conceptEmbedding: embedding });
    } catch (error) {
      console.log("PineconeService.queryConcept error", error);
    }
  }
}
