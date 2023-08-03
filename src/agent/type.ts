import { ChatMessage } from "@/chat/type";

// ********************************************************************************
export type AgentIdentifier = string /*alias*/;
export type AgentSpecs = {
  id: AgentIdentifier;
  name: string;
  // Description that provides in-context learning to the request
  description: string;
  // Color to be displayed in the chat
  color: string;
};

// == Interface =================================================================
export interface IAgent {
  /** Returns the agent's profile */
  getProfile(): Promise<AgentSpecs | null /*not found*/>;
  /** gets a response from the agent */
  getResponse(messages: ChatMessage[], onUpdate: (incoming: string) => void): Promise<void | null>;
}
