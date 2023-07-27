import { openAIChatCompletion } from "./api";

import { OpenAIChatCompletionRequest } from "./type";

/** Handles everything related to the OpenAI API
 * NOTE: For now this is the same service we use on the client side (with less functionality)
 * CHECK: We need to evaluate if it's time to change all OpenAI services to use this */
// **********************************************************************************
export class OpenAIService {
  // == Singleton =================================================================
  private static singleton: OpenAIService;
  public static getInstance() {
    if (!OpenAIService.singleton) OpenAIService.singleton = new OpenAIService();
    return OpenAIService.singleton;
  }

  // == Chat Completion ============================================================
  public async chatCompletion({ messages, ...options }: OpenAIChatCompletionRequest) {
    const { data } = await openAIChatCompletion({ messages: messages, ...options });
    return data;
  }
}
