import { nanoid } from "nanoid";
import { ChatCompletionRequestMessage } from "openai";

import { Agent } from "@/agent/type";

import { AssistantChatMessage, ChatMessage, ChatMessageRole, UserChatMessage } from "./type";

// ********************************************************************************
/** Converts a chat message to a completion message (for OpenAI) */
const chatMessageToCompletionMessage = (message: ChatMessage): ChatCompletionRequestMessage => {
  let name = "chat_user";
  if (message.role === ChatMessageRole.Function) {
    name = message.name;
  }
  if (message.role === ChatMessageRole.Assistant) {
    name = message.agent.id;
  }
  return {
    role: message.role,
    content: message.content,
    name,
  };
};

/** Converts a list of chat messages to a list of completion messages (for OpenAI) */
export const chatMessagesToCompletionMessages = (messages: ChatMessage[]): ChatCompletionRequestMessage[] => {
  return messages.map(chatMessageToCompletionMessage);
};

export const createUserMessage = (content: string = ""): UserChatMessage => {
  return { id: nanoid(), role: ChatMessageRole.User, content };
};

export const createAgentMessage = (content: string = "", agent: Agent): AssistantChatMessage => {
  return { id: nanoid(), role: ChatMessageRole.Assistant, content, agent };
};
