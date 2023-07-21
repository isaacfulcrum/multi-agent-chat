import { Concept } from "functions/src/type";
import { storeConceptVectors } from "./callable";
import { ConceptVector, ConceptVectorStoreRequest } from "./type";
import { DatabaseConcept } from "@/MemoryAgent/type";
import { MemoryAgentService } from "@/MemoryAgent/service";

const memoryAgent = new MemoryAgentService();

/** Manages everything related to Pinecone vector database */
// ****************************************************************************
export class PineconeService {
  // == Singleton =================================================================
  private static singleton: PineconeService;
  public static async getInstance() {
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

  public async simulation() {
    try {
      const concepts: DatabaseConcept[] = [
        {
          documentId: "test-concept-1",
          name: "React",
          description: "A JavaScript library for building user interfaces",
          timestamp: Date.now(),
        },
        // JavaScript
        {
          documentId: "test-concept-2",
          name: "JavaScript",
          description: "A programming language that conforms to the ECMAScript specification",
          timestamp: Date.now(),
        },
      ];

      console.log("PineconeService.simulation concepts", concepts);

      // Get embeddings for each concept
      const getConceptEmbedding = async (concept: DatabaseConcept): Promise<ConceptVector> =>
        memoryAgent.getEmbedding(concept).then((embedding) => ({
          id: concept.documentId,
          values: embedding || [],
          metadata: {
            name: concept.name,
            description: concept.description,
          },
        }));

      const conceptVectors = await Promise.all(concepts.map(getConceptEmbedding));

      console.log("PineconeService.simulation conceptVectors", conceptVectors);

      this.saveConcepts({
        agentId: "test-agent",
        concepts: conceptVectors,
      });
    } catch (error) {
      console.log("PineconeService.upsert error", error);
    }
  }

  // == Read =====================================================================
}
