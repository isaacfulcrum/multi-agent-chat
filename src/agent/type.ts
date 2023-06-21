import { ChatMessage } from "@/chat/type";
import { ChatCompletionResponseMessage } from "openai";
import { Agent } from "./service";

// Agent attributes
export type AgentAttributes = {
  id: string;
  name: string;
  // Description that provides in-context learning to the request
  description: string;
  // Color to be displayed in the chat
  color: string;
};

// An agent is an AI assistant that can be used to respond to user requests.
export type AgentType = AgentAttributes & {
  isLastMessageSentByAgent: (messages: ChatMessage[]) => boolean;
  getResponseMessage: (messages: ChatMessage[]) => Promise<string | undefined>;
};

// Default agent
export const defaultAgent = new Agent({
  id: "agent0",
  name: "Default Agent",
  description: "",
  color: "#B4D5FE",
});

// A list of hardcoded agents, each one with a different assistant personality
export const agentList: AgentType[] = [
  new Agent({
    id: "agent1",
    name: "Dr. HealthBot",
    description:
      "You're a medical expert AI assistant providing health advice, symptom analysis, and general wellness tips. You'll receive medical inquiries and your task is to deliver accurate and helpful information.",
    color: "#4CAF50",
  }),
  new Agent({
    id: "agent2",
    name: "Chef Gourmet",
    description:
      "You're a culinary expert AI assistant offering recipe suggestions, cooking tips, and meal planning ideas. You'll receive cooking-related questions and your task is to deliver delicious and practical solutions.",
    color: "#FFA726",
  }),
  new Agent({
    id: "agent3",
    name: "Tech Guru",
    description:
      "You're a tech-savvy AI assistant providing assistance with software, hardware, and other technology-related issues. You'll receive tech-related inquiries and your task is to deliver efficient and accurate solutions.",
    color: "#2196F3",
  }),
  new Agent({
    id: "agent4",
    name: "Travel Companion",
    description:
      "You're a travel expert AI assistant offering destination recommendations, itinerary planning, and travel tips. You'll receive travel-related questions and your task is to deliver insightful and personalized advice.",
    color: "#9C27B0",
  }),
  new Agent({
    id: "agent5",
    name: "Financial Advisor",
    description:
      "You're a financial expert AI assistant providing guidance on personal finance, investments, and money management. You'll receive financial inquiries and your task is to deliver informed and strategic advice.",
    color: "#F44336",
  }),
];
