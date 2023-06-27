import { BehaviorSubject } from "rxjs";
import { nanoid } from "nanoid";

import { agentServiceInstance } from "@/agent/service";

import { fetchChatCompletionStream } from "./api";
import { chatMessageToCompletionMessage, AssistantChatMessage, ChatMessage, ChatMessageRoleEnum } from "./type";

// ********************************************************************************
export class ChatService {
  private static instance: ChatService;
  public static getInstance(): ChatService {
    if (!ChatService.instance) ChatService.instance = new ChatService();
    return ChatService.instance;
  }

  // ------------------------------------------------------------------------------
  /** stream of chat messages sent to the subscribers */
  // NOTE: we use a BehaviorSubject so the subscribers get the last value when they subscribe
  private messages$: BehaviorSubject<ChatMessage[]>
  public onMessage$ = () => this.messages$;

  /** indicates if the Completion is being run */
  public isLoading: boolean = false;

  // == Lifecycle =================================================================
  protected constructor() {
    this.messages$ = new BehaviorSubject<ChatMessage[]>([]);
  }

  // == Private Methods ===========================================================
  private getMessages() {
    return this.messages$.getValue();
  }

  // == Public Methods ============================================================
  /** runs the Completion with the current messages */
  public async runCompletion() {
    if (this.isLoading) return;

    const agent = agentServiceInstance.currentAgent;
    // Format messages as OpenAI expects them
    const formattedMessages = this.getMessages().map(chatMessageToCompletionMessage);

    // If there's a current agent, we add its description as a system message
    // NOTE: add to the start of the array so it's the first message
    if (agent) formattedMessages.unshift({ role: ChatMessageRoleEnum.System, content: agent.description });

    try {
      this.isLoading = true;
      
      // Add the message to the chat
      const id = nanoid();
      let chatMessage: AssistantChatMessage;
      // If there's a current agent, we add it to the message
      if (agent) chatMessage = { id, role: ChatMessageRoleEnum.Assistant, content: "", isAgent: true, agent };
      else chatMessage = { id, role: ChatMessageRoleEnum.Assistant, content: "", isAgent: false };
      this.addMessage(chatMessage);
      
      // Fetch the response from the OpenAI API and update the content of the message
      await fetchChatCompletionStream(formattedMessages, (incomingMessage: string) => {
        this.updateMessage({ ...chatMessage, content: incomingMessage });
      });

    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  /** adds the new message to the chat */
  public async addMessage(message: ChatMessage) {
    this.messages$.next([...this.getMessages(), message]);
  }

  /** searches and updates a new message in the chat */
  public async updateMessage(message: ChatMessage) {
    this.messages$.next(this.getMessages().map((m) => m.id === message.id ? message : m));
  }

  /** removes the message from the chat */
  public async removeMessage(messageId: string) {
    this.messages$.next(this.getMessages().filter((m) => m.id !== messageId));
  }
}

// ********************************************************************************
export const chatServiceInstance = ChatService.getInstance();
