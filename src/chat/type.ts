import { ChatCompletionRequestMessage } from "openai";
import { Agent } from "@/agent/type";

// ********************************************************************************
// NOTE: using custom Enum instead of the one from openai since it's not exported as
// an enum
export enum ChatMessageRoleEnum {
  Assistant = "assistant",
  System = "system",
  User = "user",
}

export type BaseChatMessage = {
  id: string;
  role: ChatMessageRoleEnum;
  content: string;
};

// -- Assistant -------------------------------------------------------------------
export type BaseAssistantChatMessage = BaseChatMessage & {
  role: ChatMessageRoleEnum.Assistant;
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
  role: ChatMessageRoleEnum.System;
};

// -- User ------------------------------------------------------------------------
export type UserChatMessage = BaseChatMessage & {
  role: ChatMessageRoleEnum.User;
};

// --------------------------------------------------------------------------------
export type ChatMessage = AssistantChatMessage | SystemChatMessage | UserChatMessage;

// == Util ========================================================================
export const chatMessageToCompletionMessage = (message: ChatMessage): ChatCompletionRequestMessage => {
  return {
    role: message.role,
    content: message.content,
  };
};
