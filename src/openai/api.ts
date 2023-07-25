// NOTE: This shouldn't be used in the client, only in the server
// For demo purposes, we're using it in the client
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";
import { Observable, Subscriber } from "rxjs";

import {
  OpenAIChatCompletionRequest,
  OpenAIChatCompletionStreamRequest,
  OpenAIEmbeddingRequest,
  OpenAIStreamResponse,
} from "./type";

// ********************************************************************************
const OPENAI_CHAT_API = "https://api.openai.com/v1/chat/completions"; /*for stream responses*/
const API_KEY_STORE = "openai-api-key";

// == API Key =====================================================================
/** Returns the stored OpenAI API key or throws an error if it's missing */
export const getApiKey = (): string => {
  const apiKey = window.localStorage.getItem(API_KEY_STORE);
  if (!apiKey) throw new Error("Missing OpenAI API key");
  return apiKey;
};

export const storeApiKey = (apiKey: string): void => {
  window.localStorage.setItem(API_KEY_STORE, apiKey);
};

// == Client ======================================================================
/** Returns an OpenAI client needed to make requests to the API */
const openAIClient = () => {
  const apiKey = getApiKey(); /*handles missing API key*/
  const configuration = new Configuration({ apiKey });
  /*removes error "Refused to set unsafe header "User-Agent"
    NOTE: apparently this is because we're using the SDK in the client*/
  delete configuration.baseOptions.headers["User-Agent"];
  return new OpenAIApi(configuration);
};

// == Embedding ===================================================================
const embeddingModel = "text-embedding-ada-002";
/** Returns a response from the OpenAI API, which is a single message */
export const openAIEmbedding = async ({ input, ...options }: OpenAIEmbeddingRequest) => {
  const openai = openAIClient();
  return openai.createEmbedding({
    input,
    model: embeddingModel,
    ...options,
  });
};

// == Chat Completion =============================================================
const chatCompletionModel = "gpt-3.5-turbo";
const chatCompletionMaxTokens = 600;

/* Returns a response from the OpenAI API, which is a single message */
export const openAIChatCompletion = async ({ messages, ...options }: OpenAIChatCompletionRequest) => {
  const openai = openAIClient();
  return openai.createChatCompletion({
    messages,
    model: chatCompletionModel,
    max_tokens: chatCompletionMaxTokens,
    ...options,
  });
};

// -- Stream ----------------------------------------------------------------------
/** Returns a stream response from the OpenAI API
 * @see https://www.builder.io/blog/stream-ai-javascript */
export const openAIChatCompletionStream = async ({ messages, ...options }: OpenAIChatCompletionStreamRequest) => {
  const specs: CreateChatCompletionRequest = {
    messages,
    model: chatCompletionModel,
    max_tokens: chatCompletionMaxTokens,
    stream: true /** so we can update as it arrives */,
    ...options,
  };
  const apiKey = getApiKey();

  /** NOTE: we use the fetch API instead of the OpenAI SDK because the SDK doesn't support streams
   * @see https://github.com/openai/openai-node/issues/18#issuecomment-1369996933
   * FIXME: use the SDK when it supports streams */
  const stream = await fetch(OPENAI_CHAT_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(specs),
  });

  if (!stream.ok) {
    const message = await stream.json();
    const errorMessage = message.error?.message || "Unknown error";
    throw new Error(`OpenAI API returned an error: ${errorMessage}`);
  }

  // Read the stream
  return new Observable<string>((subscriber) => {
    readChatCompletionStream(subscriber, stream);
  });
};

/** Reads a stream and executes a callback once it gets a new chunk of data*/
export const readChatCompletionStream = async (subscriber: Subscriber<string>, stream: Response) => {
  try {
    // Check if the stream has a body
    if (!stream.body) {
      throw new Error("Stream body is empty");
    }
    // Read the stream until it's finished
    const reader = stream.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let incomingMessage = "";
    let incomingFunctionCall = {
      name: "",
      arguments: "",
    };
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Stream finished
        break;
      }

      // Decode the chunk
      const chunk = decoder.decode(value);
      const lines = chunk
        .toString()
        .split("\n")
        .filter((line) => line.trim() !== "");

      // Parse the chunk
      for (const line of lines) {
        const message = line.replace(/^data: /, "");
        if (message === "[DONE]") {
          subscriber.complete();
          return; // Stream finished
        }

        try {
          // NOTE: if there's a parsed message we assume it's a stream response
          const parsed: OpenAIStreamResponse = JSON.parse(message);
          const delta = parsed.choices[0].delta;
          // -- Function call ----------------------------------------------------------
          // NOTE: At the moment, we're not using this feature, but it could be useful in case we want to add custom functions
          if (delta.function_call) {
            if (delta.function_call.name) incomingFunctionCall.name += delta.function_call.name;
            if (delta.function_call.arguments) incomingFunctionCall.arguments += delta.function_call.arguments;
            // -- Message ----------------------------------------------------------------
          } else if (delta.content) {
            incomingMessage += delta.content;
            subscriber.next(incomingMessage);
          }
        } catch (error) {
          subscriber.error(`Error parsing stream response: ${error}`);
          // throw error;
        }
      }
    }
  } catch (error) {
    subscriber.error(error);
  }
};
