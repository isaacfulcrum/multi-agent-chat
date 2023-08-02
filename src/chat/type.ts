import { BehaviorSubject } from "rxjs";

import { AgentProfile } from "@/agent/type";

// ********************************************************************************
// NOTE: using custom Enum instead of the one from openai since it's not exported as
// an enum
export enum ChatMessageRole {
  Assistant = "assistant",
  System = "system",
  User = "user",
  Function = "function",
}

export type BaseChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
};

// -- Assistant -------------------------------------------------------------------
export type AssistantChatMessage = BaseChatMessage & {
  role: ChatMessageRole.Assistant;
  agent: AgentProfile;
};

// -- System ----------------------------------------------------------------------
export type SystemChatMessage = BaseChatMessage & {
  role: ChatMessageRole.System;
};

// -- User ------------------------------------------------------------------------
export type UserChatMessage = BaseChatMessage & {
  role: ChatMessageRole.User;
};

// -- Function --------------------------------------------------------------------
export type FunctionChatMessage = BaseChatMessage & {
  role: ChatMessageRole.Function;
  name: string;
};

// --------------------------------------------------------------------------------
export type ChatMessage = AssistantChatMessage | SystemChatMessage | UserChatMessage | FunctionChatMessage;

// == Abstract ====================================================================
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
  requestCompletion(): Promise<void>;
}

export abstract class AbstractChatService implements IChatService {
  protected constructor() {
    this.messages$ = new BehaviorSubject<ChatMessage[]>([]);
    this.isLoading = false /*by default*/;
  }

  // == Messages ==================================================================
  /** stream of chat messages sent to the subscribers */
  protected messages$: BehaviorSubject<ChatMessage[]>;
  // NOTE: we use a BehaviorSubject so the subscribers get the last value when they subscribe
  public onMessage$() {
    return this.messages$;
  }

  public getMessages() {
    /*TODO: getValue() method is not standard throughout this project (as is only a BehaviorSubject method),
    refactor  to use the observable directly*/
    return this.messages$.getValue();
  }

  public async addMessage(message: ChatMessage) {
    this.messages$.next([...this.getMessages(), message]);
  }

  public async updateMessage(message: ChatMessage) {
    this.messages$.next(this.getMessages().map((m) => (m.id === message.id ? message : m)));
  }

  public async removeMessage(messageId: string) {
    this.messages$.next(this.getMessages().filter((m) => m.id !== messageId));
  }

  // == Completion ================================================================
  /**if the completion is runnning*/
  protected isLoading: boolean;
  async requestCompletion(): Promise<void> {
    /*template method*/
  }
}
