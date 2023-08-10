import { CreateChatCompletionResponse } from "openai";

import { truncateMessagesToMaxTokens } from "@/util/tokens";
import { ChatMessageRole } from "@/chat/type";
import { AbstractService } from "@/util/service";

import { getApiKey, openAIChatCompletion, openAIChatCompletionStream, openAIEmbedding, storeApiKey } from "./api";
import { ChatCompletionServiceRequest, MAX_REQUEST_TOKENS, OpenAIApiKey, OpenAIEmbeddingRequest, isChatMessageArray } from "./type";
import { chatMessagesToCompletionMessages } from "./util";

/** Handles everything related to the OpenAI API */
// **********************************************************************************
export class OpenAIService extends AbstractService {
  constructor() {
    super("OpenAI Service");
  }

  // == API Key ===================================================================
  /** Returns the stored OpenAI API key */
  public getApiKey(): OpenAIApiKey | null /*error*/ {
    try {
      return getApiKey();
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }

  /** Stores the given API key */
  public storeApiKey(apiKey: OpenAIApiKey): void {
    return storeApiKey(apiKey);
  }

  // == Chat Completion ============================================================
  public async chatCompletion({ messages, systemMessage, ...options }: ChatCompletionServiceRequest): Promise<CreateChatCompletionResponse> {
    try {
      const completionMessages = isChatMessageArray(messages) ? chatMessagesToCompletionMessages(messages) : messages;
      if (systemMessage) {
        // Add system message to the front of the messages array
        completionMessages.unshift({ role: ChatMessageRole.System, content: systemMessage });
      }
      const truncatedMessages = truncateMessagesToMaxTokens(completionMessages, MAX_REQUEST_TOKENS);
      const { data } = await openAIChatCompletion({ messages: truncatedMessages, ...options });
      return data;
    } catch (e) {
      if (e instanceof Error) this.logger.error(e.message);
      throw new Error("Error getting chat completion");
    }
  }

  public async chatCompletionStream({ messages, systemMessage, ...options }: ChatCompletionServiceRequest, onUpdate: (val: string) => void) {
    try {
      const completionMessages = isChatMessageArray(messages) ? chatMessagesToCompletionMessages(messages) : messages;
      if (systemMessage) {
        // Add system message to the front of the messages array
        completionMessages.unshift({ role: ChatMessageRole.System, content: systemMessage });
      }
      const truncatedMessages = truncateMessagesToMaxTokens(completionMessages, MAX_REQUEST_TOKENS);
      return openAIChatCompletionStream({ messages: truncatedMessages, ...options }, onUpdate);
    } catch (e) {
      if (e instanceof Error) this.logger.error(e.message);
      throw new Error("Error getting chat completion");
    }
  }

  // == Embedding ==================================================================
  public async getEmbedding(args: OpenAIEmbeddingRequest) {
    try {
      const { data } = await openAIEmbedding(args);
      return data;
    } catch (e) {
      console.error("Error getting embedding: ", e);
      if (e instanceof Error) this.logger.error(e.message);
      throw new Error("Error getting chat embedding");
    }
  }
}
