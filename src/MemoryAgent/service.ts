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
      description: `extracts key concepts from the conversation, returns a list of concepts without formatting.`,
      parameters: {
        type: "object",
        properties: {},
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
      const completion = await openAIChatCompletion([systemMessage, ...messageHistory], {
        functions: this.functions,
      });

      if (completion.choices[0].message?.function_call) {
        const functionCall = completion.choices[0].message.function_call;
        if (functionCall.name === "extractKeyConcepts") {
          /** Check if the last {@link MAX_CONSECUTIVE_FUNCTION_CALLS} messages were not function calls */
          const messages = [...messageHistory];
          const isConsecutive = messages.slice(-1)[0].name === "extractKeyConcepts";
          if (isConsecutive) {
            console.log(`Trying to extract key concepts from consecutive function calls. Skipping.`);
            // this.formatKeyConcepts(messageHistory);
            return;
          }
          await this.extractKeyConcepts(messageHistory);
        }
      } else {
        console.log("No function call message: ", completion.choices[0].message?.content);
      }
    } catch (error) {
      console.error("Error creating memories: ", error);
    }
  }

  // == Key Concepts ================================================================
  public extractKeyConcepts = async (messages: ChatCompletionRequestMessage[]) => {
    try {
      const systemMessage = {
        role: ChatMessageRole.System,
        content: MentalModelAgent,
      };
      const completion = await openAIChatCompletion([systemMessage, ...messages]);
      if (completion.choices[0].message?.content) {
        await this.formatKeyConcepts(completion.choices[0].message.content);
      } else {
        throw new Error("No message content");
      }
      // Send back results
    } catch (error) {
      console.error("Error extracting key concepts: ", error);
    }
  };

  public formatKeyConcepts = async (prompt: string) => {
    const completion = await openAICompletion(formatterAgent + prompt);
    console.log("Completion: ", completion.choices[0].text);
  };
}
