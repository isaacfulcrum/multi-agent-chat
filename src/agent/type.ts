import { ChatCompletionRequestMessage } from "openai";

import { ChatFunctions, chatFunctions } from "@/chat/function";
import { OpenAIService } from "@/openai/service";

// ********************************************************************************
export type Agent = {
  id: string;
  name: string;
  // Description that provides in-context learning to the request
  description: string;
  // Color to be displayed in the chat
  color: string;
};

export type createAgentRequest = {
  name: string;
  description: string;
  color: string;
};

// == Util ======================================================================
// TODO: this should be moved to the agent service
/** Given a set of messages, returns the selected agentId */
export const fetchAgent = async (
  messages: ChatCompletionRequestMessage[]
): Promise<string | undefined /*no agent*/> => {
  try {
    const response = await OpenAIService.getInstance().chatCompletion({
      messages,
      functions: chatFunctions,
      function_call: {
        name: ChatFunctions.selectAgent /** forces it to select an agent */,
      },
    });
    if (!response) throw new Error("No response from OpenAI API");
    // Return the arguments of the function call
    return response.choices[0].message?.function_call?.arguments;
  } catch (error) {
    // Type assertion: Treat the error as 'any'
    const errorWithResponse = error as any;

    // Check if the error object has a property called 'response'
    if (errorWithResponse.response) {
      const errorMessage = errorWithResponse.response?.data?.error?.message;
      throw new Error(`OpenAI API returned an error: ${errorMessage}`);
    }
    // If it doesn't have a 'response' property, re-throw the original error
    throw error;
  }
};
