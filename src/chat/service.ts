import { ChatMessage } from "./type";
import AgentServiceInstance from "@/agent/service";

export class ChatService {
  private static instance: ChatService;
  messages: ChatMessage[] = [];
  onMessageAdded?: () => void;

  // == Singleton =================================================================
  public static getInstance(): ChatService {
    if (!ChatService.instance) ChatService.instance = new ChatService();
    return ChatService.instance;
  }
  // == Lifecycle =================================================================
  protected constructor() {}

  // == Public Methods ============================================================
  addMessage(message: ChatMessage) {
    this.messages.push(message);
    if (this.onMessageAdded) {
      this.onMessageAdded();
    }
    console.log("AgentServiceInstance.currentAgent", AgentServiceInstance.currentAgent);
  }
}

const ChatServiceInstance = ChatService.getInstance();
export default ChatServiceInstance;
