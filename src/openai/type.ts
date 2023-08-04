import { ChatMessage } from "@/chat/type";
import { CreateChatCompletionRequest, CreateEmbeddingRequest } from "openai";

//*********************************************************************************
// === Constants ==================================================================
export const MAX_TOTAL_TOKENS = 4000; /*max tokens for openAI*/
export const MAX_RESPONSE_TOKENS = 1000; /*max tokens for openAI response*/
export const MAX_REQUEST_TOKENS = MAX_TOTAL_TOKENS - MAX_RESPONSE_TOKENS; /*max tokens for openAI request*/

// === Api ========================================================================
export type OpenAIApiKey = string; /*alias*/

// === Embedding ==================================================================
export type OpenAIEmbeddingRequest = Partial<CreateEmbeddingRequest> & Pick<CreateEmbeddingRequest, "input">; /* input is required */

// === Chat completion ============================================================
export type OpenAIChatCompletionRequest = Partial<CreateChatCompletionRequest> & Pick<CreateChatCompletionRequest, "messages">; /* messages is required */

export type OpenAIChatCompletionStreamRequest = Exclude<OpenAIChatCompletionRequest, "stream"> /*stream is not allowed to change*/;

// === Service ====================================================================
export type ChatCompletionServiceRequest = Omit<Partial<CreateChatCompletionRequest>, "stream" | "messages"> & {
  messages: ChatMessage[] /* the service transforms this messages into OpenAI messages */;
  systemMessage?: string /* optional system message to add to the front of the messages array */;
};

// === Stream =====================================================================
type OpenAIStreamChoice = {
  delta: {
    content?: string;
    function_call?: {
      name: string;
      arguments: {
        [key: string]: string;
      };
    };
  };
  finish_reason: string;
  index: number;
};

// NOTE: using a custom Type because it doesn't seem to an official one
export type OpenAIStreamResponse = {
  choices: OpenAIStreamChoice[];
  id: string;
  model: string;
  object: string;
};
