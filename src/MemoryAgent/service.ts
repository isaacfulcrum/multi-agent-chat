import { ChatCompletionFunctions, ChatCompletionRequestMessage } from "openai";

import { ChatMessageRole } from "@/chat/type";
import { openAIChatCompletion } from "@/chat/api";

import { MentalModelAgent } from "./agent";

// ****************************************************************************
/** Monitors the current coversation to store key information in memory */
export class MemoryAgentService {
  private functions: ChatCompletionFunctions[] = [
    {
      name: "informationExtraction",
      description: `Extracts the key concepts from a conversation.`,
      parameters: {
        type: "object",
        properties: {
          info: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "Title of the concept" },
                meaning: { type: "string", description: "Description of the concept" },
              },
              required: ["title", "meaning"],
            },
          },
        },
        required: ["info"],
      },
    },
  ];

  constructor() {}

  // == Memory ======================================================================
  /** Creates a new set of memories based on the given message history */
  public async createMemories(messageHistory: ChatCompletionRequestMessage[]) {
    try {
      /* Format the conversation to be sent to the memory agent */
      const prompt = messageHistory.map((message) => `${message.name}: ${message.content}`).join("\n");

      const systemMessage = {
        role: ChatMessageRole.System,
        content: MentalModelAgent,
      };
      const userMessage = {
        role: ChatMessageRole.User,
        content: "Extract the key concepts of the next conversation. Conversation: " + prompt,
        name: "User",
      };

      const completion = await openAIChatCompletion([systemMessage, userMessage], {
        functions: this.functions,
        function_call: {
          name: "informationExtraction",
        },
      });

      if (completion.choices[0].message?.function_call) {
        const functionCall = completion.choices[0].message.function_call;

        if (!functionCall.arguments) throw new Error("No function call arguments");
        const args = JSON.parse(functionCall.arguments);

        if (functionCall.name === "informationExtraction") {
          console.log("Key Concepts: ", args);
          // TODO: Store the key concepts in the database
        }
      } else {
        console.log("No function call message: ", completion.choices[0].message?.content);
      }
    } catch (error) {
      console.error("Error creating memories: ", error);
    }
  }
}
