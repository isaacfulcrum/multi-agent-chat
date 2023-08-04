import { logServiceInstance } from "@/log/service";
import { getApiKey, openAIChatCompletion, openAIChatCompletionStream, openAIEmbedding, storeApiKey } from "./api";

import { truncateMessagesToMaxTokens } from "@/util/tokens";
import { ChatMessage, ChatMessageRole } from "@/chat/type";

import { ChatCompletionServiceRequest, MAX_REQUEST_TOKENS, OpenAIApiKey, OpenAIEmbeddingRequest } from "./type";
import { chatMessagesToCompletionMessages } from "./util";

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
  public async chatCompletion({ messages, systemMessage, ...options }: ChatCompletionServiceRequest) {
    try {
      const completionMessages = chatMessagesToCompletionMessages(messages);
      if (systemMessage) {
        // Add system message to the front of the messages array
        completionMessages.unshift({ role: ChatMessageRole.System, content: systemMessage });
      }
      const truncatedMessages = truncateMessagesToMaxTokens(completionMessages, MAX_REQUEST_TOKENS);
      const { data } = await openAIChatCompletion({ messages: truncatedMessages, ...options });
      return data;
    } catch (e) {
      console.error("Error getting chat completion: ", e);
      if (e instanceof Error) this.errorLog(e.message);
      return null;
    }
  }

  public async chatCompletionStream({ messages, systemMessage, ...options }: ChatCompletionServiceRequest, onUpdate: (val: string) => void) {
    try {
      const completionMessages = chatMessagesToCompletionMessages(messages);
      if (systemMessage) {
        // Add system message to the front of the messages array
        completionMessages.unshift({ role: ChatMessageRole.System, content: systemMessage });
      }
      const truncatedMessages = truncateMessagesToMaxTokens(completionMessages, MAX_REQUEST_TOKENS);
      return openAIChatCompletionStream({ messages: truncatedMessages, ...options }, onUpdate);
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
