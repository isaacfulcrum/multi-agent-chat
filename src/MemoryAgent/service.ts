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
              required: ["name", "description"],
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
      const response = (await getData()) as any;
      return response.data.result;
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

  public async mergeConcepts(concepts: Concept[]) {
    const memories = (await this.getMemories()) as Concept[];
    console.log("Concepts: ", concepts);
    console.log("Memories: ", memories as Concept[]);
   

    const prompt = `OLD CONCEPTS: ${JSON.stringify(memories)} \n\n  NEW CONCEPTS: ${JSON.stringify(concepts)}\n`;

    const userMessage = {
      role: ChatMessageRole.User,
      content: "I have a new set of concepts, help me complement them with a list of old concepts I had: " + prompt,
      name: "User",
    };

    const completion = await openAIChatCompletion([userMessage], {
      functions: this.functions,
      function_call: {
        name: "informationExtraction",
      },
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log("Completion: ", completion);

    if (completion.choices[0].message?.function_call) {
      const functionCall = completion.choices[0].message.function_call;

      if (!functionCall.arguments) throw new Error("No function call arguments");
      const args = JSON.parse(functionCall.arguments);

      if (functionCall.name === "informationExtraction") {
        console.log("Concepts: ", args.info);
        // await this.setMemories(args.info);
      }
    }
  }

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
          await this.mergeConcepts(args.info);
          // await this.setMemories(args.info);
        }
      } else {
        console.log("No function call message: ", completion.choices[0].message?.content);
      }
    } catch (error) {
      console.error("Error creating memories: ", error);
    }
  }
}
