import { ChatCompletionFunctions, ChatCompletionRequestMessage } from "openai";

import { ChatMessageRole } from "@/chat/type";
import { openAIChatCompletion } from "@/chat/api";

// ****************************************************************************
// == Concept ===================================================================
export type ConceptIdentifier = string /*alias*/;
type BaseConcept = {
  name: string;
  description: string;
};

export type KnownConcept = BaseConcept & {
  conceptId: ConceptIdentifier; /*the existing id of the concept in the database*/
};

type withEmbedding = {
  embedding: number[];
};

export type Concept = BaseConcept | KnownConcept;
export type ConceptWithEmbedding = Concept & withEmbedding;

// == Request ===================================================================
export type ConceptDescriptionStorageRequest = {
  agentId: string; /*the agent that the concept belongs to*/
  concepts: ConceptWithEmbedding[];
};

// == Functions ===================================================================
enum MemoryAgentFunctions {
  informationExtraction = "informationExtraction",
}
export const functions: ChatCompletionFunctions[] = [
  {
    name: MemoryAgentFunctions.informationExtraction,
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

// == Util ======================================================================
type ExtractInformationArgs = {
  prompt: string;
  agentDescription?: string;
};

/** Returns a list of arguments of key concepts given a prompt
 *  @param prompt This promt should include information to extract concepts from and clear instructions on how to do so.
 *  @param agentDescription This is the description of the agent that will be used to extract information */
export const extractInformation = async ({
  prompt,
  agentDescription,
}: ExtractInformationArgs): Promise<Concept[] | undefined /*no response*/> => {
  const instruction = {
    role: ChatMessageRole.User,
    content: prompt,
    name: "user",
  };
  const messages: ChatCompletionRequestMessage[] = [instruction];

  if (agentDescription) {
    const systemMessage = {
      role: ChatMessageRole.System,
      content: agentDescription,
    };
    messages.unshift(systemMessage);
  }

  try {
    const completion = await openAIChatCompletion(messages, {
      functions,
      function_call: {
        name: MemoryAgentFunctions.informationExtraction,
      },
      max_tokens: 1000,
    });
    const functionCall = completion.choices[0].message?.function_call;
    if (functionCall && functionCall.arguments) {
      const args = JSON.parse(functionCall.arguments);
      return args.info;
    } else {
      throw new Error("No function call arguments");
    }
  } catch (error) {
    console.error("Error extracting information: ", error);
  }
};
