import { CreateChatCompletionRequest, CreateEmbeddingRequest } from "openai";

//*********************************************************************************
// === Api ========================================================================
export type OpenAIApiKey = string; /*alias*/

// === Embedding ==================================================================
export type OpenAIEmbeddingRequest = Partial<CreateEmbeddingRequest> &
  Pick<CreateEmbeddingRequest, "input">; /* input is required */

// === Chat completion ============================================================
export type OpenAIChatCompletionRequest = Partial<CreateChatCompletionRequest> &
  Pick<CreateChatCompletionRequest, "messages">; /* messages is required */

export type OpenAIChatCompletionStreamRequest = Exclude<
  OpenAIChatCompletionRequest,
  "stream"
> /*stream is not allowed to change*/;

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
