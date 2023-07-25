import { ChatCompletionRequestMessage } from "openai";
import { Agent } from "@/agent/type";
import { nanoid } from "nanoid";

// ********************************************************************************
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
export type BaseAssistantChatMessage = BaseChatMessage & {
  role: ChatMessageRole.Assistant;
};
export type WithAgent = {
  isAgent: true;
  agent: Agent;
};
export type WithoutAgent = {
  isAgent: false;
};

export type AgentChatMessage = BaseAssistantChatMessage & WithAgent;
export type NonAgentChatMessage = BaseAssistantChatMessage & WithoutAgent;
export type AssistantChatMessage = AgentChatMessage | NonAgentChatMessage;

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
export const chatMessageToCompletionMessage = (message: ChatMessage): ChatCompletionRequestMessage => {
  let name = "chat_user";
  if (message.role === ChatMessageRole.Function) {
    name = message.name;
  }
  if (message.role === ChatMessageRole.Assistant) {
    if (message.isAgent) {
      name = message.agent.id;
    } else {
      name = "chat_assistant";
    }
  }
  return {
    role: message.role,
    content: message.content,
    name,
  };
};

export const createUserMessage = (content: string = ""): UserChatMessage => {
  return { id: nanoid(), role: ChatMessageRole.User, content };
};

export const createAssistantMessage = (content: string = ""): NonAgentChatMessage => {
  return { id: nanoid(), role: ChatMessageRole.Assistant, content, isAgent: false };
};

export const createAgentMessage = (content: string = "", agent: Agent): AgentChatMessage => {
  return { id: nanoid(), role: ChatMessageRole.Assistant, content, isAgent: true, agent };
};