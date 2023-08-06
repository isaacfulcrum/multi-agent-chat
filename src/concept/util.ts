import { ChatCompletionRequestMessage } from "openai";

import { OpenAIService } from "@/openai/service";

import { MentalModelAgent, ScoringAgent } from "./prompt";
import { Concept, ConceptFunctions, ConceptWithScore, conceptExtractionFunctions, conceptScoringFunctions } from "./type";
import { ChatMessageRole } from "@/chat/type";

// ****************************************************************************
/** Returns a list of arguments of key concepts given a list of messages*/
export const conceptExtractionRequest = async (messageHistory: ChatCompletionRequestMessage[]): Promise<Concept[]> => {
  /* Format the conversation to be sent to the memory agent */
  const conversation = messageHistory.map((message) => `${message.name}: ${message.content}`).join("\n");

  const messages: ChatCompletionRequestMessage[] = [
    {
      role: ChatMessageRole.System,
      content: MentalModelAgent,
    },
    {
      role: ChatMessageRole.User,
      content:
        `Extract the key concepts of the next conversation. 
          Limit yourself to the more important concepts, no more than 10 are required. 
          Try extracting concepts you as an LLM don't know about.
          Conversation: ` + conversation,
      name: "user",
    },
  ];

  const completion = await OpenAIService.getInstance().chatCompletion({
    messages,
    functions: conceptExtractionFunctions,
    function_call: {
      name: ConceptFunctions.informationExtraction,
    },
    max_tokens: 1000,
  });
  if (!completion) throw new Error("No completion returned");

  const functionCall = completion.choices[0].message?.function_call;
  if (functionCall && functionCall.arguments) {
    const args = JSON.parse(functionCall.arguments);
    return args.info;
  } else {
    throw new Error("No function call arguments");
  }
};

/** Returns a list of arguments of key concepts given a prompt */
export const conceptScoringRequest = async (concepts: Concept[], agentDescription: string): Promise<ConceptWithScore[]> => {
  const messages: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: ScoringAgent,
    },
    {
      role: "user",
      content: `
      AGENT DESCRIPTION: You are a Science professor that has worked at the University of Oxford in the last 10 years. You are an expert in the field of neuroscience and have published several papers in the field.
  
      CONCEPTS
      Weather: The state of the atmosphere at a place and time as regards heat, dryness, sunshine, wind, rain, etc.
      Brain: An organ of soft nervous tissue contained in the skull of vertebrates, functioning as the coordinating center of sensation and intellectual and nervous activity.
      Dopamine: A compound present in the body as a neurotransmitter and a precursor of other substances including epinephrine.
      React: A JavaScript library for building user interfaces.
      Alien: A hypothetical or fictional being from another world.
      People: Human beings in general or considered collectively.
      `,
    },
    {
      role: "function",
      name: ConceptFunctions.conceptScoring,
      content: JSON.stringify({
        info: [
          { name: "Weather", score: 0.0 },
          { name: "React", score: 0.0 },
          { name: "Alien", score: 0.0 },
          { name: "Brain", score: 1.0 },
          { name: "Dopamine", score: 1.0 },
          { name: "People", score: 0.5 },
        ],
      }),
    },
    {
      role: "user",
      content: `
      AGENT DESCRIPTION: ${agentDescription}
      CONCEPTS
      ${concepts.map((concept) => `${concept.name}: ${concept.description}`).join("\n")}`,
    },
  ];

  const completion = await OpenAIService.getInstance().chatCompletion({
    messages,
    functions: conceptScoringFunctions,
    function_call: {
      name: ConceptFunctions.conceptScoring,
    },
    max_tokens: 1000,
    temperature: 0.2,
  });

  if (!completion) throw new Error("No completion found");
  const functionCall = completion.choices[0].message?.function_call;

  if (functionCall && functionCall.arguments) {
    const args = JSON.parse(functionCall.arguments);
    const scores = args.info as ConceptWithScore[];
    return scores;
  } else {
    throw new Error("No function call arguments");
  }
};
