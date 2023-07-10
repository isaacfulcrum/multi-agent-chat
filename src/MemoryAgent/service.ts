import { ChatCompletionFunctions, ChatCompletionRequestMessage } from "openai";

import { ChatMessageRole } from "@/chat/type";
import { openAIChatCompletion, openAICompletion } from "@/chat/api";

import { MemoryAgent, MentalModelAgent, formatterAgent } from "./agent";

// *****************************************************************************
/** Monitors the current coversation to store key information in memory */
export class MemoryAgentService {
  private functions: ChatCompletionFunctions[] = [
    {
      name: "extractKeyConcepts",
      description: `extracts key concepts from a given paragraph. It can be used to get a summary back.`,
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "Prompt to extract key concepts from.",
          },
        },
      },
    },
    {
      name: "formatKeyConcepts",
      description: `extracts key concepts from the conversation, returns a list of concepts without formatting.`,
      parameters: {
        type: "object",
        properties: {
          keyConcepts: {
            type: "string",
            description: "List of key concepts to format to json.",
          },
        },
      },
    },
  ];

  constructor() {}

  // == Memory ======================================================================
  /** Creates a new set of memories based on the given message history */
  public async createMemories(messageHistory: ChatCompletionRequestMessage[]) {
    try {
      const systemMessage = {
        role: ChatMessageRole.System,
        content: MemoryAgent,
      };

      console.log(messageHistory);
      const completion = await openAIChatCompletion([systemMessage, ...messageHistory], {
        functions: this.functions,
      });


      if (completion.choices[0].message?.function_call) {
        const functionCall = completion.choices[0].message.function_call;
        let content = "";

        /* Check if there's no looping in the function calls */
        const isFunctionLooping = functionCall.name === messageHistory.slice(-1)[0].name;
        if (isFunctionLooping) throw new Error("Function looping detected");

        if (!functionCall.arguments) throw new Error("No function call arguments");
        const args = JSON.parse(functionCall.arguments) as { prompt: string };
        
        if (functionCall.name === "extractKeyConcepts") {
          console.log("Extracting key concepts...");
          const response = await this.extractKeyConcepts(args.prompt);
          if (!response) throw new Error("No response from extractKeyConcepts");
          console.log("Done extracting key concepts: ", response);
          content = response;
          
        } else if (functionCall.name === "formatKeyConcepts") {
          console.log("Formatting key concepts...");
          const response = await this.formatKeyConcepts(args.prompt);
          if (!response) throw new Error("No response from formatKeyConcepts");
          console.log("Done formatting key concepts...", response);
          content = response;
        }

        this.createMemories([
          ...messageHistory,
          {
            role: ChatMessageRole.Function,
            name: functionCall.name,
            content,
          },
        ]);

      } else {
        console.log("No function call message: ", completion.choices[0].message?.content);
      }
    } catch (error) {
      console.error("Error creating memories: ", error);
    }
  }

  // == Key Concepts ================================================================
  public extractKeyConcepts = async (prompt: string) => {
    try {
      const completion = await openAICompletion(MentalModelAgent + prompt);
      if (completion.choices[0].text) {
        return completion.choices[0].text;
      } else {
        throw new Error("No message content");
      }
      // Send back results
    } catch (error) {
      console.error("Error extracting key concepts: ", error);
    }
  };

  public formatKeyConcepts = async (prompt: string) => {
    try {
      const completion = await openAICompletion(formatterAgent + prompt);
      console.log("Completion: ", completion.choices[0].text);
      return completion.choices[0].text;
    } catch (error) {
      console.error("Error formatting key concepts: ", error);
    }
  };
}
