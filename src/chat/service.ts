import { nanoid } from "nanoid";

import { agentServiceInstance } from "@/agent/service";

import { getChatCompletion } from "./api";
import { chatMessageToCompletionMessage, AssistantChatMessage, ChatMessage, ChatMessageRoleEnum } from "./type";

// ********************************************************************************
export class ChatService {
  private static instance: ChatService;
  public static getInstance(): ChatService {
    if (!ChatService.instance) ChatService.instance = new ChatService();
    return ChatService.instance;
  }

  // ------------------------------------------------------------------------------
  public messages: ChatMessage[] = [];  
  // stores the subscribers to the messages
  /** listener to notify the UI that a new message has been added */
  private readonly subscribers: ((messages: ChatMessage[]) => void)[] = [];

  /** indicates if the Completion is being run */
  public isLoading: boolean = false;

  // == Lifecycle =================================================================
  protected constructor() {}

  // == Private Methods ===========================================================
  public async runCompletion() {
    if(this.isLoading) return;

    const agent = agentServiceInstance.currentAgent;
    // Format messages as OpenAI expects them
    const formatedMessages = this.messages.map(chatMessageToCompletionMessage);

    // If there's a current agent, we add its description as a system message
    // NOTE: add to the start of the array so it's the first message
    if (agent) formatedMessages.unshift({ role: ChatMessageRoleEnum.System, content: agent.description, });

    // Send new message the chat
    try {
      this.isLoading = true;
      const content = await getChatCompletion(formatedMessages),
      id = nanoid();
      let message: AssistantChatMessage;
      // If there's a current agent, we add it to the message
      if (agent) message = { id, role: ChatMessageRoleEnum.Assistant, content, isAgent: true, agent, };
      else message = { id, role: ChatMessageRoleEnum.Assistant, content, isAgent: false, };

      this.addMessage(message);
    } catch (error) {
      console.error(error);
    } finally { 
      this.isLoading = false;
    }
  }

  // == Public Methods ============================================================
  /** adds the message to the chat and emit the new messages to the subscribers */
  public async addMessage(message: ChatMessage) {
    // NOTE: creates a new array to trigger the subscribers
    this.messages = [...this.messages, message];
    this.subscribers.forEach((subscriber) => subscriber(this.messages));
  }

  // == Subscriptions =============================================================
  /** subscribes to the messages */
  public onMessages(subscriber: (messages: ChatMessage[]) => void): () => void/*un-subscribe*/ {
    this.subscribers.push(subscriber);

    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index > -1) this.subscribers.splice(index, 1);
    };
  }
}

// ********************************************************************************
export const chatServiceInstance = ChatService.getInstance();
