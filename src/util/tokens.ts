import {  ChatMessageRole } from "@/chat/type";
import { ChatCompletionRequestMessage } from "openai";

const AVG_CHAR_PER_TOKEN = 4;

/** Calculates the number of tokens for a given text using a simple heuristic. */
export const calculateTokenFromMessage = (message: ChatCompletionRequestMessage) => {
  return Math.ceil(`${message.content} ${message.role} ${message.name}`.length / AVG_CHAR_PER_TOKEN);
};

export const truncateMessagesToMaxTokens = (messages: ChatCompletionRequestMessage[], maxTokens: number) => {
  let currentTokens = 0;
  let truncatedMessages: ChatCompletionRequestMessage[] = [];

  const reverseMessages = [...messages].reverse(); /* NOTE: reverse to truncate from most recent to oldest */
  /** If there's a system message add it to the truncated list and update the token count */
  const systemMessage = messages.find((message) => message.role === ChatMessageRole.System);
  if (systemMessage) {
    currentTokens += calculateTokenFromMessage(systemMessage);
    // remove the system message from the list
    reverseMessages.pop();
  }

  // === Truncate messages ==========================================================
  for (const message of reverseMessages) {
    // Calculate the number of tokens for the current message
    const messageTokens = calculateTokenFromMessage(message);
    // If adding the current message exceeds the max token limit, break the loop
    if (currentTokens + messageTokens > maxTokens) {
      break;
    }

    // Otherwise, add the message to the truncated list and update the token count
    truncatedMessages.unshift(message);
    currentTokens += messageTokens;
  }

  /** After truncating the messages, if there's a system message, add it to the start */
  if (systemMessage) {
    truncatedMessages.unshift(systemMessage);
  }

  return truncatedMessages;
};
