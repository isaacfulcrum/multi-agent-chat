import { ChatCompletionFunctions } from "openai";

export enum ChatFunctions {
  runCompletion = "runCompletion",
}

export const moderatorDescription = `
  You're an AI moderator who oversees the interactions between the user and various AI agents. 
  In the conversation below, you can see that the user is talking to an AI assistant.  

  If the last message was sent by an agent, respond with "user" to allow the user to respond.

  You have the ability to select an appropriate agent based on the context of the user's input, if
  there's no need for someone specialized, you can respond with "default". 
  You have access to a list of all available agents, their IDs, and descriptions. 
  The list is as follows:
`;

export const chatFunctions: ChatCompletionFunctions[] = [
  {
    name: ChatFunctions.runCompletion,
    description: `Continues the conversation with the selected agent. 
    If there's no agent selected, it will respond with a default agent with no special properties.
    If the id "user" is passed, the user will be able to respond.`,
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
