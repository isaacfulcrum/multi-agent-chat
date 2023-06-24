// NOTE: This shouldn't be used in the client, only in the server
// For demo purposes, we're using it in the client
import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionRequest,
  OpenAIApi,
} from "openai";
import { BehaviorSubject, Subject } from "rxjs";

// ********************************************************************************
const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const OPENAI_CHAT_API = "https://api.openai.com/v1/chat/completions";

// Subject indicating the stream of messages sent to the subscribers
// NOTE: we use a BehaviorSubject so the subscribers get the last value when they subscribe
const chatCompletionSubject = new BehaviorSubject<string>("");
let currentMessage = "";
const updateMessage = (newContent: string) => {
  currentMessage += newContent;
  chatCompletionSubject.next(currentMessage);
};

const resetMessage = () => {
  currentMessage = "";
  chatCompletionSubject.next(currentMessage);
};

export const getChatCompletion = (): Subject<string> => {
  return chatCompletionSubject;
};

export const fetchChatCompletion = async (
  messages: ChatCompletionRequestMessage[]
): Promise<void> => {
  try {
    const specs: CreateChatCompletionRequest = {
      model: "gpt-4",
      messages,
      max_tokens: 600,
      stream: true, // For streaming responses
    };

    // Fetch the response from the OpenAI API with the signal from AbortController
    const response = await fetch(OPENAI_CHAT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify(specs),
    });

    if (!response.body) {
      throw new Error("Network response was not ok");
    }

    // Read the response as a stream of data
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Stream finished
        break;
      }
      // Massage and parse the chunk of data
      const chunk = decoder.decode(value);
      const lines = chunk
        .toString()
        .split("\n")
        .filter((line) => line.trim() !== "");
      for (const line of lines) {
        const message = line.replace(/^data: /, "");
        if (message === "[DONE]") {
          resetMessage();
          return; // Stream finished
        }
        try {
          const parsed = JSON.parse(message);
          const { choices } = parsed;
        const { delta } = choices[0];
        const { content } = delta;
          if (content !== undefined) {
            updateMessage(parsed.choices[0].delta?.content);
          }
        } catch (error) {
          console.error("Could not JSON parse stream message", message, error);
        }
      }
    }
  } catch (error) {
    chatCompletionSubject.error(error);
  }
};
