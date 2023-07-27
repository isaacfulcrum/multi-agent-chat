import { CreateChatCompletionRequest } from "openai";

//*********************************************************************************
// === Constants ==================================================================
export const MAX_TOTAL_TOKENS = 4000; /*max tokens for openAI*/
export const MAX_RESPONSE_TOKENS = 1000; /*max tokens for openAI response*/
export const MAX_REQUEST_TOKENS = MAX_TOTAL_TOKENS - MAX_RESPONSE_TOKENS; /*max tokens for openAI request*/

// === Chat completion ============================================================
export type OpenAIChatCompletionRequest = Partial<CreateChatCompletionRequest> &
  Pick<CreateChatCompletionRequest, "messages">; /* messages is required */
