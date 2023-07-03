import { ChatCompletionFunctions } from "openai";

export enum ChatFunctions {
  runCompletion = "runCompletion",
  selectAgent = "selectAgent",
}

export const moderatorDescription = `
  You're an AI moderator who oversees the interactions between the user and various Agents.
  An Agent is an AI that has a unique personality and will respond differently to the user.

  Your primary task is to coordinate the conversation between the user and the agents.
  
  You will select an agent to respond to the conversation, send a message as that agent, and then 
  keep moderating the conversation.

  You can select an agent by calling the "selectAgent" function.
  After a function call selecting an agent, you'll send a message as that agent.

  Do not call a function twice in a row.
  
  Make the conversation engaging, with multiple agents giving different responses to the user.

  You have access to a list of all available agents, their IDs, and descriptions. If the list is empty, you must return a "default" as an id.
  List of agents:
`;

export const chatFunctions: ChatCompletionFunctions[] = [
  {
    name: ChatFunctions.selectAgent,
    description: `Given an agent id, the next message will be sent by the selected agent.
    It will return the description of the selected agent. Your next answer must follow the description.
    
    `,
    parameters: {
      type: "object",
      properties: {
        agentId: {
          type: "string",
          description: "Selected agent id",
        },
      },
    },
  },
];
