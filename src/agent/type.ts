import { ChatMessage } from "@/chat/type";
import { IService } from "@/util/service";

// ********************************************************************************
export type AgentIdentifier = string /*alias*/;

// == Specs =======================================================================
/** Strictly required by ANY agent */
export type BaseAgentSpecs = {
  id: AgentIdentifier; /*unique identifier used throughout the system*/
  name: string;
};

/** Required by conversational agents which specs are stored in the database */
export type ConversationalAgentSpecs = BaseAgentSpecs & {
  // Description that provides in-context learning to the request
  description: string;
  // Color to be displayed in the chat
  color: string;
  // Has memory
  hasMemory: boolean; /*if true, the agent will remember the interactions*/
};

export type AgentSpecs = BaseAgentSpecs | ConversationalAgentSpecs;

// .... Type guards ...............................................................
export const isConversationalAgentSpecs = (specs: AgentSpecs): specs is ConversationalAgentSpecs => {
  return (specs as ConversationalAgentSpecs).description !== undefined;
};


// == Interface =================================================================
export interface IAgent extends IService {
  /** Returns the agent's specs */
  getSpecs(): AgentSpecs;
  /** gets a response from the agent */
  getResponse(messages: ChatMessage[], onUpdate: (incoming: string) => void): Promise<void | null>;
}
