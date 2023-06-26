import { BehaviorSubject } from "rxjs";
import { nanoid } from "nanoid";

import { agentServiceInstance } from "@/agent/service";

import { fetchChatCompletionStream, readChatCompletionStream } from "./api";
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

  /** stream of updated messages sent to the subscribers */
  // NOTE: we use a BehaviorSubject so the subscribers get the last value when they subscribe
  public readonly onMessageUpdates$: BehaviorSubject<ChatMessage[]>;

  /** indicates if the Completion is being run */
  public isLoading: boolean = false;

  // == Lifecycle =================================================================
  protected constructor() {
    this.onMessageUpdates$ = new BehaviorSubject(this.messages);
  }

  // == Public Methods ============================================================
  /** runs the Completion with the current messages */
  public async runCompletion() {
    if (this.isLoading) return;

    const agent = agentServiceInstance.currentAgent;
    // Format messages as OpenAI expects them
    const formattedMessages = this.messages.map(chatMessageToCompletionMessage);

    // If there's a current agent, we add its description as a system message
    // NOTE: add to the start of the array so it's the first message
    if (agent) formattedMessages.unshift({ role: ChatMessageRoleEnum.System, content: agent.description });

    try {
      this.isLoading = true;
      // NOTE: We need the stream first, so we can read it after the message is added to the chat
      const stream = await fetchChatCompletionStream(formattedMessages);
      if (!stream) throw new Error("Could not fetch chat completion");
      
      // Add the message to the chat
      const id = nanoid();
      let chatMessage: AssistantChatMessage;
      // If there's a current agent, we add it to the message
      if (agent) chatMessage = { id, role: ChatMessageRoleEnum.Assistant, content: "", isAgent: true, agent };
      else chatMessage = { id, role: ChatMessageRoleEnum.Assistant, content: "", isAgent: false };
      this.addMessage(chatMessage);

      // Read the stream and add the chunks to the message
      readChatCompletionStream(stream, (incomingMessage: string) => {
        // Add the chunk to the message
        chatMessage.content += incomingMessage;
        // Mutate the array to trigger the subscribers
        this.messages = [...this.messages];
        this.onMessageUpdates$.next(this.messages);
      });
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  /** adds the message to the chat and emit the new messages to the subscribers */
  public async addMessage(message: ChatMessage) {
    // NOTE: creates a new array to trigger the subscribers
    this.messages = [...this.messages, message];
    // Emit the new messages to the subscribers
    this.onMessageUpdates$.next(this.messages);
  }

  /** searches and updates a new message in the chat */
  public async updateMessage(message: ChatMessage) {
    // Search the message in the array and replace it
    this.messages = this.messages.map((m) => (m.id === message.id ? message : m));
    this.onMessageUpdates$.next(this.messages);
  }

  /** removes the message from the chat */
  public async removeMessage(messageId: string) {
    // Search the message in the array and remove it
    this.messages = this.messages.filter((m) => m.id !== messageId);
    this.onMessageUpdates$.next(this.messages);
  }
}

// ********************************************************************************
export const chatServiceInstance = ChatService.getInstance();
