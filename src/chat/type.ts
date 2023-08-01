import { ChatCompletionRequestMessage } from "openai";
import { Agent } from "@/agent/type";
import { nanoid } from "nanoid";

// ********************************************************************************
// == Completion ==================================================================
export enum CompletionMode {
  Single = "single",
  Multiple = "multiple",
}

// NOTE: using custom Enum instead of the one from openai since it's not exported as
// an enum
export enum ChatMessageRole {
  Assistant = "assistant",
  System = "system",
  User = "user",
  Function = "function",
}

export type BaseChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
};

// -- Assistant -------------------------------------------------------------------
export type AssistantChatMessage = BaseChatMessage & {
  role: ChatMessageRole.Assistant;
  agent: Agent;
};

// -- System ----------------------------------------------------------------------
export type SystemChatMessage = BaseChatMessage & {
  role: ChatMessageRole.System;
};

// -- User ------------------------------------------------------------------------
export type UserChatMessage = BaseChatMessage & {
  role: ChatMessageRole.User;
};

// -- Function --------------------------------------------------------------------
export type FunctionChatMessage = BaseChatMessage & {
  role: ChatMessageRole.Function;
  name: string;
};

// --------------------------------------------------------------------------------
export type ChatMessage = AssistantChatMessage | SystemChatMessage | UserChatMessage | FunctionChatMessage;

// == Util ========================================================================
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
