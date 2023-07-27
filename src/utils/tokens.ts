import { ChatMessage } from "@/chat/type";
import { OpenAIChatCompletionRequest } from "@/openai/type";
import { ChatCompletionRequestMessage } from "openai";

const AVG_CHAR_PER_TOKEN = 4;

/** Calculates the number of tokens for a given text using a simple heuristic. */
const calculateTokens = (text: string) => {
  return Math.ceil(text.length / AVG_CHAR_PER_TOKEN);
};

export const truncateMessagesToMaxTokens = (messages: ChatCompletionRequestMessage[], maxTokens: number) => {
  let currentTokens = 0;
  let truncatedMessages: ChatCompletionRequestMessage[] = [];

  const reverseMessages = [...messages].reverse();

  for (const message of reverseMessages) {
    // Calculate the number of tokens for the current message
    const messageTokens = calculateTokens(`${message.name} ${message.content} ${message.role}`);

    // If adding the current message exceeds the max token limit, break the loop
    if (currentTokens + messageTokens > maxTokens) {
      break;
    }

    // Otherwise, add the message to the truncated list and update the token count
    truncatedMessages.unshift(message);
    currentTokens += messageTokens;
  }
  console.log(currentTokens, maxTokens)
  console.log("truncateMessagesToMaxTokens truncatedMessages", truncatedMessages);
  return truncatedMessages;
};
