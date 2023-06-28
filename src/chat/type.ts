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

// == OpenAI ======================================================================
type OpenAIStreamChoice = {
  delta: {
    content?: string;
    function_call?: {
      name: string;
      arguments: {
        [key: string]: string;
      };
    };
  };
  finish_reason: string;
  index: number;
};

// NOTE: using a custom Type because it doesn't seem to an official one
export type OpenAIStreamResponse = {
  choices: OpenAIStreamChoice[];
  id: string;
  model: string;
  object: string;
};

// == Completion ===================================================================

enum CompletionType {
  function = "function",
  message = "message",
}

export type MessageCompletion = {
  type: CompletionType.message;
  message: string;
};

export type FunctionCompletion = {
  type: CompletionType.function;
  function_call: {
    name: string;
    arguments: string;
  }
};

export type Completion = MessageCompletion | FunctionCompletion;


// == Util ========================================================================
export const chatMessageToCompletionMessage = (message: ChatMessage): ChatCompletionRequestMessage => {
  return {
    role: message.role,
    content: message.content,
  };
};
