import { BehaviorSubject } from "rxjs";

import { ChatMessage, CompletionMode, chatMessagesToCompletionMessages } from "./type";
import { ConversationalAgentOpenAI } from "@/agent/service";

// ********************************************************************************
interface IChatService {
  // == Messages ==================================================================
  onMessage$(): BehaviorSubject<ChatMessage[]>;
  getMessages(): ChatMessage[];
  addMessage(message: ChatMessage): void;
  removeMessage(messageId: string): void;

  // == Completion ================================================================
  isLoading: boolean;
  requestCompletion(mode: CompletionMode): Promise<void>;
}

class AbstractChatService implements IChatService {
  // == Lifecycle =================================================================
  protected constructor() {
    this.messages$ = new BehaviorSubject<ChatMessage[]>([]);
    this.isLoading = false;
  }

  // == Messages ==================================================================
  /** stream of chat messages sent to the subscribers */
  protected messages$: BehaviorSubject<ChatMessage[]>;
  // NOTE: we use a BehaviorSubject so the subscribers get the last value when they subscribe
  public onMessage$() {
    return this.messages$;
  }

  //** returns the current messages directly from the source */
  public getMessages() {
    /*TODO: getValue() method is not standard throughout this project (as is only a BehaviorSubject method),
    refactor  to use the observable directly*/
    return this.messages$.getValue();
  }

  /** adds the new message to the chat */
  public async addMessage(message: ChatMessage) {
    this.messages$.next([...this.getMessages(), message]);
  }

  /** searches and updates a new message in the chat */
  public async updateMessage(message: ChatMessage) {
    this.messages$.next(this.getMessages().map((m) => (m.id === message.id ? message : m)));
  }

  /** removes the message from the chat */
  public async removeMessage(messageId: string) {
    this.messages$.next(this.getMessages().filter((m) => m.id !== messageId));
  }

  // == Completion ================================================================
  isLoading: boolean;
  async requestCompletion(mode: CompletionMode): Promise<void> {
    throw new Error("Method not implemented."); // Provide a default error for unimplemented methods
  }
}

export class ChatServiceSingle extends AbstractChatService {
  // == Singleton =================================================================
  private static singleton: ChatServiceSingle;
  public static getInstance() {
    if (!ChatServiceSingle.singleton) ChatServiceSingle.singleton = new ChatServiceSingle();
    return ChatServiceSingle.singleton;
  }

  // == Lifecycle =================================================================
  protected constructor() {
    super();
  }

  // == Completion ================================================================
  /** Support for different modes of sending messages to the chat as an agent
   *  Respond based on the following conditions:
   *  1. The previous {@link MAX_CONSECUTIVE_ASSISTANT_MESSAGES } messages where not
   *     sent exclusively by the assistant.
   *  2. An agent cannot respond consecutively. */
  public requestCompletion = async () => {
    try {
      const agent = new ConversationalAgentOpenAI("agent-id", "agent-name", "agent-description");
      this.isLoading = true;
      // add the message and keep updating it until the agent finishes responding
      const message = agent.createNewMessage();
      this.addMessage(message);
      await agent.getResponse(chatMessagesToCompletionMessages(this.getMessages()), (content) => this.updateMessage({ ...message, content }));
    } catch (error) {
      console.error(error);
      // Handle error
    } finally {
      this.isLoading = false;
    }
  };
}
