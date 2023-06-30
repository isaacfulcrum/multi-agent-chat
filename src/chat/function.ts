import { ChatCompletionFunctions } from "openai";

export enum ChatFunctions {
  runCompletion = "runCompletion",
}

export const moderatorDescription = `
  You're an AI moderator who oversees the interactions between the user and various assistants. 
  Your primary task is to make a unique conversation between the user and the assistants.
  Every assistant has a unique personality and will respond differently to the user.
  
  Given the context of the conversation, you must select an assistant to continue the conversation 
  or let the user respond. 
  
  Try to make the conversation as interesting as possible, if there's nothing that an assistant can say,
  it's okay to let the user respond. You must have invoked the function before letting the user respond.

  You have access to a list of all available agents, their IDs, and descriptions. If the list is empty, you must return a "default" as an id.
  List of agents:
`;

export const chatFunctions: ChatCompletionFunctions[] = [
  {
    name: ChatFunctions.runCompletion,
    description: `Continues the conversation with the selected agent. 
    If there's no agent selected, the user will be able to respond.`,
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
