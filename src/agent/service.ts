import { AgentAttributes, AgentType } from "./type";
import { ChatMessage } from "@/chat/type";
import { getChatCompletion } from "./api";
import { ChatCompletionRequestMessageRoleEnum } from "openai";

// This class represents an agent in the chat, it has the ability to send messages
// with the description
export class Agent implements AgentType {
  id: string;
  name: string;
  description: string;
  color: string;

  // Initialize the agent
  constructor({ id, name, description, color }: AgentAttributes) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.color = color;
  }

  // Know if the last message was sent by an agent
  isLastMessageSentByAgent(messages: ChatMessage[]) {
    if (messages.length === 0) return false;
    return !!messages[messages.length - 1].agent?.id;
  }

  // Return a message from the agent based on the user's message
  async getResponseMessage(messages: ChatMessage[]) {
    const systemMessages: ChatMessage[] = [...messages];
    if (this.description) {
      // The agent will send a message with the system role without storing it
      // This will allow OpenAI to know the persona of the agent and respond accordingly
      systemMessages.push({
        id: "system", // Generic ID required for our messages
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: this.description,
      });
    }

    return await getChatCompletion(systemMessages);
  }
}
