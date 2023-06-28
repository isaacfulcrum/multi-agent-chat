// NOTE: This shouldn't be used in the client, only in the server
// For demo purposes, we're using it in the client
import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";

import { OpenAIStreamResponse } from "./type";
import { chatFunctions } from "./command";

// ********************************************************************************
const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const OPENAI_CHAT_API = "https://api.openai.com/v1/chat/completions";

/** Returns a stream response from the OpenAI API 
 * @see https://www.builder.io/blog/stream-ai-javascript */
export const fetchChatCompletionStream = async (messages: ChatCompletionRequestMessage[], onUpdate: (incomingData: string) => void) => {
  try {
    const specs: CreateChatCompletionRequest = {
      model: "gpt-4",
      messages,
      max_tokens: 600,
      functions: chatFunctions,
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

    console.log("stream", stream)


    // Read the stream
    // await readChatCompletionStream(stream, onUpdate);

  } catch (error) {
    // TODO: handle error
    console.error("Error:", error);
  }
};

/** Reads a stream and executes a callback once it gets a new chunk of data*/
export const readChatCompletionStream = async (
  stream: Response,
  onUpdate: (incomingData: string) => void
) => {
  try {
    // Check if the stream has a body
    if (!stream.body) {
      throw new Error("Stream body is empty");
    }
    // Read the stream until it's finished
    const reader = stream.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let incomingMessage = ""
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Stream finished
        break;
      }

      // Decode the chunk
      const chunk = decoder.decode(value);
      const lines = chunk.toString().split("\n").filter((line) => line.trim() !== "");

      // Parse the chunk
      for (const line of lines) {
        const message = line.replace(/^data: /, "");
        if (message === "[DONE]") {
          return; // Stream finished
        }
        const parsed: OpenAIStreamResponse = JSON.parse(message);
        // NOTE: if there's a parsed message we assume it's a stream response
        const incomingContent = parsed.choices[0].delta?.content;
        if (incomingContent !== undefined) {
          incomingMessage += incomingContent;
          onUpdate(incomingMessage);
        }
      }
    }
  } catch (error) {
    // TODO: handle error
    console.error("Error:", error);
  }
};
