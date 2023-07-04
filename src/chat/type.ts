import { ChatCompletionRequestMessage } from "openai";
import { Agent } from "@/agent/type";

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
