import { ChatCompletionRequestMessage } from "openai";
import { getChatCompletion } from "./api";
import {
  AssistantChatMessage,
  ChatMessage,
  ChatMessageRoleEnum,
  chatMessageToCompletionMessage,
} from "./type";
import AgentServiceInstance from "@/agent/service";
import { nanoid } from "nanoid";

export class ChatService {
  private static instance: ChatService;
  messages: ChatMessage[] = [];
  isBotTyping: boolean = false;
  onMessageAdded?: () => void;

  // == Singleton =================================================================
  public static getInstance(): ChatService {
    if (!ChatService.instance) ChatService.instance = new ChatService();
    return ChatService.instance;
  }
  // == Lifecycle =================================================================
  protected constructor() {}

  // == Private Methods ===========================================================
  private async requestChatResponse() {
    // Format messages as OpenAI expects them
    const formatedMessages: ChatCompletionRequestMessage[] = this.messages.map(
      chatMessageToCompletionMessage
    );

    // If there's a current agent, we add its description as a system message
    if (AgentServiceInstance.currentAgent) {
      formatedMessages.push({
        role: ChatMessageRoleEnum.System,
        content: AgentServiceInstance.currentAgent.description,
      });
    }
    // Send new message the chat
    try {
      this.isBotTyping = true;
      const message = await getChatCompletion(formatedMessages);
      if (!message) return;

      // Create new message
      let newChatMessage: AssistantChatMessage;
      
      // If there's a current agent, we add it to the message
      if (AgentServiceInstance.currentAgent) {
        newChatMessage = {
          id: nanoid(),
          role: ChatMessageRoleEnum.Assistant,
          content: message,
          isAgent: true,
          agent: AgentServiceInstance.currentAgent,
        };
      } else {
        newChatMessage = {
          id: nanoid(),
          role: ChatMessageRoleEnum.Assistant,
          content: message,
          isAgent: false,
        };
      }
      this.addMessage(newChatMessage);
    } catch (error) {
      console.error(error);
    }
    this.isBotTyping = false;
  }

  // == Public Methods ============================================================
  addMessage(message: ChatMessage) {
    this.messages.push(message);
    if (this.onMessageAdded) {
      this.onMessageAdded();
    }
    // If the message has the role user, we request a response from the agent
    if (message.role === "user") {
      this.requestChatResponse();
    }
  }
}

const ChatServiceInstance = ChatService.getInstance();
export default ChatServiceInstance;
