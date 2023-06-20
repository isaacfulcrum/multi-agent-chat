// An agent is an AI with a set of predefined traits.
export type Agent = {
  id: string;
  // Name that identifies the agent
  name: string;
  // Description that provides in-context learning to the request
  description: string;
  // Color to be displayed in the chat
  color: string;
};

export type ChatMessage = {
  id: string;
  agent?: Agent;
  message: string;
};
