// An agent is a bot that can be used to respond to user requests
export type Agent = {
  id: string;
  name: string;
  // Description that provides in-context learning to the request
  description: string;
  // Color to be displayed in the chat
  color: string;
};

export type ChatMessage = {
  id: string;
  message: string;
  // In case an agent sends the message,
  // this property will include the agent's information
  agent?: Agent;
};
