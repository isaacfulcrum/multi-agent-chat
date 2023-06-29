import { ChatCompletionFunctions } from "openai";

export enum ChatFunctions {
  runCompletion = "runCompletion",
}

export const moderatorDescription = `
  You're an AI moderator who oversees the interactions between the user and various assistants. 
  Your primary task is to make a unique conversation between the user and the assistants.
  Every assistant has a unique personality and will respond differently to the user.
  Given the context of the conversation, you muest select an assistant to continue the conversation 
  or let the user respond. You must have sent at least 1 message before letting the user respond.
  You have access to a list of all available agents, their IDs, and descriptions: 
`;

export const chatFunctions: ChatCompletionFunctions[] = [
  {
    name: ChatFunctions.runCompletion,
    description: `Continues the conversation with the selected agent. 
    If there's no agent selected,  the user will be able to respond.`,
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
