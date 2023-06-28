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
    description:
      "Run a completion on the given conversation, it will append a new message to the conversation and stream back the result. It accepts an agents id as parameter.",
    parameters: {
      type: "object",
      properties: {
        agent: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", description: "The name of the agent" },
            description: {
              type: "string",
              description:
                "It describes how the agent behaves itself. e.g: You are a tech expert that...",
            },
            color: { type: "string", description: "The color displayed for the agent." },
          },
        },
      },
    },
  },
];
