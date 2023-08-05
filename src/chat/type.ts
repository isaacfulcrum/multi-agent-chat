import { BehaviorSubject } from "rxjs";
import { IconType } from "react-icons";
import { MdOutlineGroups, MdOutlinePersonOutline, MdOutlineRocketLaunch } from "react-icons/md";

import { AgentSpecs } from "@/agent/type";
import { AbstractService, IService } from "@/util/service";

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
  agent: AgentSpecs;
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

// == Modes =======================================================================
export enum ChatMode {
  Single,
  Interactive,
  Iterative,
}

export type ChatModeSpecs = {
  name: string;
  description: string;
  icon: IconType;
  link: string;
};

export const chatModeSpecsDefinition: Record<ChatMode, ChatModeSpecs> = {
  [ChatMode.Single]: {
    name: "Single Agent Chat",
    description: "Have a one-on-one conversation with an AI-powered agent specialized in a specific field. Get personalized responses and expert insights tailored to your questions.",
    icon: MdOutlinePersonOutline,
    link: "/",
  },
  [ChatMode.Interactive]: {
    name: "Interactive Agent Chat",
    description: "Experience dynamic and engaging conversations as the system intelligently selects the best-suited AI agent to chat with you based on your queries. Enjoy a variety of perspectives and expertise.",
    icon: MdOutlineRocketLaunch,
    link: "/interactive",
  },
  [ChatMode.Iterative]: {
    name: "Iterative Agent Chat",
    description:
      "Immerse yourself in a multi-agent chat session where different AI agents take turns interacting with you. Each agent brings their unique knowledge and strengths, making for a well-rounded and informative exchange.",
    icon: MdOutlineGroups,
    link: "/iterative",
  },
};

/** List of available chat modes */
export const chatModeList = Object.values(chatModeSpecsDefinition);

// == Abstract ====================================================================
export interface IChatService extends IService {
  getSpecs(): ChatModeSpecs;
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

export abstract class AbstractChatService extends AbstractService implements IChatService {
  protected constructor() {
    super("Chat Service");
    this.messages$ = new BehaviorSubject<ChatMessage[]>([]);
    this.isLoading = false /*by default*/;
  }

  // == Specs ======================================================================
  protected abstract chatMode: ChatMode;
  public getSpecs(): ChatModeSpecs {
    return chatModeSpecsDefinition[this.chatMode];
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
