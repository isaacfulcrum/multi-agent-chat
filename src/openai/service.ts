import { logServiceInstance } from "@/log/service";
import { getApiKey, openAIChatCompletion, openAIChatCompletionStream, openAIEmbedding, storeApiKey } from "./api";

import { OpenAIApiKey, OpenAIChatCompletionRequest, OpenAIChatCompletionStreamRequest, OpenAIEmbeddingRequest } from "./type";

/** Handles everything related to the OpenAI API */
// **********************************************************************************
export class OpenAIService {
  // == Singleton =================================================================
  private static singleton: OpenAIService;
  public static getInstance() {
    if (!OpenAIService.singleton) OpenAIService.singleton = new OpenAIService();
    return OpenAIService.singleton;
  }

  // == Logs ======================================================================
  private errorLog(message: string) {
    logServiceInstance.errorLog(message, "OpenAIService");
  }

  // == API Key ===================================================================
  /** Returns the stored OpenAI API key */
  public getApiKey(): OpenAIApiKey | null /*error*/ {
    try {
      return getApiKey();
    } catch (e) {
      console.error("Error getting API key: ", e);
      if (e instanceof Error) this.errorLog(e.message);
      return null;
    }
  }

  /** Stores the given API key */
  public storeApiKey(apiKey: OpenAIApiKey): void {
    return storeApiKey(apiKey);
  }

  // == Chat Completion ============================================================
  public async chatCompletion(args: OpenAIChatCompletionRequest) {
    try {
      const { data } = await openAIChatCompletion(args);
      return data;
    } catch (e) {
      console.error("Error getting chat completion: ", e);
      if (e instanceof Error) this.errorLog(e.message);
      return null;
    }
  }

  public async chatCompletionStream(args: OpenAIChatCompletionStreamRequest) {
    try {
      return await openAIChatCompletionStream(args);
    } catch (e) {
      console.error("Error getting chat completion: ", e);
      if (e instanceof Error) this.errorLog(e.message);
      return null;
    }
  }

  // == Embedding ==================================================================
  public async getEmbedding(args: OpenAIEmbeddingRequest) {
    try {
      const { data } = await openAIEmbedding(args);
      return data;
    } catch (e) {
      console.error("Error getting embedding: ", e);
      if (e instanceof Error) this.errorLog(e.message);
      return null;
    }
  }
}
