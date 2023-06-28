import { ChatCompletionFunctions } from "openai";

enum ChatFunctions {
  runCompletion = "runCompletion",
}

// export const chatFunction = {
//   [ChatFunctionsEnum.runCompletion]: chatServiceInstance.runCompletion,
//   [ChatFunctionsEnum.getAgents]: agentServiceInstance.getAgents,
// };

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
