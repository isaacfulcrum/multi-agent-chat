import { ChatMessage } from "@/chat/type";
import { IService } from "@/util/service";

// ********************************************************************************
export type AgentIdentifier = string /*alias*/;

// == Specs =======================================================================
/** Strictly required by ANY agent */
export type BaseAgentSpecs = {
  id: AgentIdentifier;
};

/** Required by conversational agents (agents who participate in the chat) */
export type ConversationalAgentSpecs = BaseAgentSpecs & {
  name: string;
  // Description that provides in-context learning to the request
  description: string;
  // Color to be displayed in the chat
  color: string;
};

export const isConversationalAgentSpecs = (specs: AgentSpecs): specs is ConversationalAgentSpecs => {
  return (specs as ConversationalAgentSpecs).name !== undefined;
};

export type AgentSpecs = BaseAgentSpecs | ConversationalAgentSpecs;

// == Interface =================================================================
export interface IAgent extends IService {
  /** Returns the agent's specs */
  getSpecs(): AgentSpecs;
  /** gets a response from the agent */
  getResponse(messages: ChatMessage[], onUpdate: (incoming: string) => void): Promise<void | null>;
}
