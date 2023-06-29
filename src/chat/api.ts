// NOTE: This shouldn't be used in the client, only in the server
// For demo purposes, we're using it in the client
import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";

import { OpenAIStreamResponse } from "./type";
import { ChatFunctions, chatFunctions } from "./function";
import { Observable, Subscriber } from "rxjs";

// ********************************************************************************
const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const OPENAI_CHAT_API = "https://api.openai.com/v1/chat/completions";

/** Selects an agent to keep the conversation flowing */
export const fetchAgent = async (messages: ChatCompletionRequestMessage[]) => {
  try {
    // Asks the agent to continue the conversation
    const { data } = await openai.createChatCompletion({
      model: "gpt-4",
      messages,
      max_tokens: 600,
      functions: chatFunctions,
      function_call: {
        name: ChatFunctions.runCompletion, /** forces it to call this function */
      },
    });
    // Read the stream
    return data.choices[0].message?.function_call;
  } catch (error) {
    // TODO: handle error
    console.error("Error:", error);
  }
};

/** Returns a stream response from the OpenAI API
 * @see https://www.builder.io/blog/stream-ai-javascript */
export const fetchChatCompletionStream = async (messages: ChatCompletionRequestMessage[]) => {
  try {
    const specs: CreateChatCompletionRequest = {
      model: "gpt-4",
      messages,
      max_tokens: 600,
      stream: true,
    };

    // Fetch the response from the OpenAI API
    // NOTE: we use the fetch API instead of the OpenAI SDK because the SDK doesn't support streams
    // https://github.com/openai/openai-node/issues/18#issuecomment-1369996933
    // FIXME: use the SDK when it supports streams
    const stream = await fetch(OPENAI_CHAT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify(specs),
    });

    // Read the stream
    return new Observable<string>((subscriber) => {
      readChatCompletionStream(subscriber, stream);
    });
  } catch (error) {
    // TODO: handle error
    console.error("Error:", error);
  }
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
          console.log("Error parsing message: ", error);
        }
      }
    }
  } catch (error) {
    // TODO: handle error
    subscriber.error(error);
  }
};
