import { ChatCompletionFunctions, ChatCompletionRequestMessage } from "openai";
import { httpsCallable } from "firebase/functions";

import { ChatMessageRole } from "@/chat/type";
import { openAIChatCompletion } from "@/chat/api";
import { firebaseFunctions } from "@/chat/firebase";

import { MentalModelAgent } from "./agent";
import { Concept } from "./type";

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
                name: { type: "string", description: "Title of the concept" },
                description: { type: "string", description: "Description of the concept" },
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

  // == Firebase Functions =========================================================
  private getMemories = async () => {
    try {
      const getData = httpsCallable(firebaseFunctions, "getMemories");
      const response = await getData();
      console.log("Response: ", response);
    } catch (error) {
      console.error("Error getting memories: ", error);
    }
  };

  // == Firebase Functions =========================================================
  private setMemories = async (concepts: Concept[]) => {
    try {
      const memories = await this.getMemories();
      // TODO: Merge the memories with the new concepts
      const storeData = httpsCallable(firebaseFunctions, "storeMemories");
      const response = await storeData(concepts);
      console.log("Response: ", response);
    } catch (error) {
      console.error("Error getting memories: ", error);
    }
  };

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
          await this.setMemories(args.info);
        }
      } else {
        console.log("No function call message: ", completion.choices[0].message?.content);
      }
    } catch (error) {
      console.error("Error creating memories: ", error);
    }
  }
}
