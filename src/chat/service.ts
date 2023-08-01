import { BehaviorSubject } from "rxjs";

import { ChatMessage, CompletionMode, chatMessagesToCompletionMessages } from "./type";
import { ConversationalAgentOpenAI } from "@/agent/service";

// ********************************************************************************
interface IChatService {
  // == Messages ==================================================================
  /** stream of chat messages sent to the subscribers */
  onMessage$(): BehaviorSubject<ChatMessage[]>;
  /** returns the current messages directly from the source */
  getMessages(): ChatMessage[];
  /** adds the new message to the chat */
  addMessage(message: ChatMessage): void;
  /** searches and updates a new message in the chat */
  updateMessage(message: ChatMessage): void;
  /** removes the message from the chat */
  removeMessage(messageId: string): void /** CHECK: change messageId for consistency? */;

  // == Completion ================================================================
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
  protected isLoading: boolean;
  async requestCompletion(mode: CompletionMode): Promise<void> {
    /*template method*/
  }
}

//
export class SingleAgentChat extends AbstractChatService {
  // == Singleton =================================================================
  private static singleton: SingleAgentChat;
  public static getInstance() {
    if (!SingleAgentChat.singleton) SingleAgentChat.singleton = new SingleAgentChat();
    return SingleAgentChat.singleton;
  }

  // == Lifecycle =================================================================
  protected constructor() {
    super();
  }

  // == Completion ================================================================
  /** Single agent completion request, in this mode the selected agent in XXX will
   * be the one responding*/
  public requestCompletion = async () => {
    try {
      /*get the selected agent from XXX*/
      const agent = new ConversationalAgentOpenAI("1", "Multi-Agent ChatBot", "You are a helpful assistant designed talking to a user on a conversation app called Multi-Agent Chat", "#BABABA");
      const message = agent.createNewMessage();

      this.isLoading = true;
      let messageAdded = false; /*add the message only when we have an actual response*/
      await agent.getResponse(chatMessagesToCompletionMessages(this.getMessages()), (content) => {
        if (!messageAdded) {
          this.addMessage({ ...message, content });
          messageAdded = true;
          return;
        }
        this.updateMessage({ ...message, content });
      });
      this.isLoading = false;
    } catch (error) {
      console.error(error);
      // Handle error
    } finally {
    }
  };
}
