import { ChatCompletionFunctions } from "openai";

export enum ChatFunctions {
  runCompletion = "runCompletion",
}

export const moderatorDescription = `
  You're an AI moderator who oversees the interactions between the user and various AI agents. 
  Your primary task is to monitor the messages exchanged between the user and the agents, to ensure 
  that the conversation is productive and respectful. You have the ability to select an appropriate agent 
  based on the context of the user's input. When you don't have enough context to make an educated guess 
  it's best you don't select an agent. You have access to a list of all available agents, their IDs, and descriptions. 
  Your goal is to facilitate smooth and effective communication, ensuring the user's needs are met and 
  the conversation stays on track. 
  The list is as follows:
`;

export const chatFunctions: ChatCompletionFunctions[] = [
  {
    name: ChatFunctions.runCompletion,
    description: `Run a completion on the given conversation, it will append a new message to the conversation and stream back the result. 
      It accepts an agent's id as parameter. `,
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
  {
    name: "test",
    description: `this is a test. `,
    parameters: {
      type: "object",
      properties: {},
    },
  },
];
