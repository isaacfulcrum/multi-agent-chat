/* An agent is an AI with a set of predefined traits
   It needs a name that identifies it and a description 
   that provides in-context learning to the request. Also, 
   it needs a color to be displayed in the chat. */
export type Agent = {
  id: string;
  name: string;
  color: string;
  description: string;
};
/*  A message to be displayed in the chat, also contains the agent that
    sent it. If no agent is provided, the message is sent by the user. */
export type ChatMessage = {
  id: string;
  agent?: Agent;
  message: string;
};
