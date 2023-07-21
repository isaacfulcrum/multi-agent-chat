import { createIndex, upsert } from "./callable";

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
  public async create() {
    try {
      const response = createIndex();
      console.log("PineconeService.create response", response);
    } catch (error) {
      console.log("PineconeService.create error", error);
    }
  }

  public async insert() {
    try {
      const response = upsert();
      console.log("PineconeService.upsert response", response);
    } catch (error) {
      console.log("PineconeService.upsert error", error);
    }
  }

  // == Read =====================================================================
}
