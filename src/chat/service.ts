import { BehaviorSubject } from "rxjs";

import { Agent } from "@/agent/type";
import { agentServiceInstance } from "@/agent/service";
import { ConceptService } from "@/concept/service";

import { AssistantChatMessage, ChatMessage, ChatMessageRole, createAssistantMessage, createAgentMessage, isAgentMessage, CompletionMode, chatMessagesToCompletionMessages } from "./type";
import { OpenAIService } from "@/openai/service";

const conceptAgent = new ConceptService();
const MAX_CONSECUTIVE_ASSISTANT_MESSAGES = 5;

// ********************************************************************************
export class ChatService {
  // == Singleton =================================================================
  private static singleton: ChatService;
  public static getInstance() {
    if (!ChatService.singleton) ChatService.singleton = new ChatService();
    return ChatService.singleton;
  }

  // ------------------------------------------------------------------------------
  /** stream of chat messages sent to the subscribers */
  // NOTE: we use a BehaviorSubject so the subscribers get the last value when they subscribe
  private messages$: BehaviorSubject<ChatMessage[]>;
  public onMessage$() {
    return this.messages$;
  }

  /** indicates if the Completion is being run */
  public isLoading: boolean = false;

  // == Lifecycle =================================================================
  protected constructor() {
    this.messages$ = new BehaviorSubject<ChatMessage[]>([]);
  }

  // == Messages ======================================================================
  //** returns the current messages directly from the source */
  private getMessages() {
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
  /** Support for different modes of sending messages to the chat as an agent
   *  Respond based on the following conditions:
   *  1. The previous {@link MAX_CONSECUTIVE_ASSISTANT_MESSAGES } messages where not
   *     sent exclusively by the assistant.
   *  2. An agent cannot respond consecutively. */
  public requestCompletion = async (mode: CompletionMode) => {
    const messages = this.getMessages();
    let selectedAgent: Agent | null /*not found*/ = null;
    if (this.isLoading) throw new Error("Another completion is already in progress.");

    const isConsecutive = messages.slice(-MAX_CONSECUTIVE_ASSISTANT_MESSAGES).every((message) => message.role === ChatMessageRole.Assistant);
    if (isConsecutive) return;

    /* NOTE: Between modes the only difference is the way the agent is selected.
       CHECK: Maybe a switch is clearer?*/
    if (mode === CompletionMode.Single) {
      selectedAgent = agentServiceInstance.getSelectedAgent();
    } else if (CompletionMode.Multiple) {
      selectedAgent = await agentServiceInstance.selectAgent(messages);
    }
    // TODO: Add "Self Performance Promting" technique in another case

    if (selectedAgent) {
      const lastMessage = messages[messages.length - 1];
      const alreadyResponded = isAgentMessage(lastMessage) && lastMessage.agent.id === selectedAgent.id;
      if (alreadyResponded) return;
    }

    await this.runCompletion(messages, selectedAgent ?? undefined /*TODO: refactor*/);

    /* This is a promise, but we don't need to wait for it
    if this the best way to handle this? */
    conceptAgent.extractConcepts(messages);

    // Keep responding if the mode is multiple
    if (mode === CompletionMode.Multiple) {
      this.requestCompletion(mode);
    }
  };

  /** Requests a completion to the OpenAI API and updates the message with the response
   * @param messages the history the completion will be based on.
   * @param agent an optional agent that will be the one responding to the completion.
   *        If no agent is passed, no system message will be added.*/
  private async runCompletion(messages: ChatMessage[], agent?: Agent) {
    try {
      if (messages.length === 0) throw new Error("No messages available for completion.");
      this.isLoading = true;

      const completionMessages = chatMessagesToCompletionMessages(messages);
      let chatMessage: AssistantChatMessage = createAssistantMessage();

      if (agent) {
        /* NOTE: add to the start of the array so it's the first message. */
        const systemMessage = { role: ChatMessageRole.System, content: agent.description };
        completionMessages.unshift(systemMessage);
        chatMessage = createAgentMessage("", agent);
      }

      // TODO: Find a way to avoid this
      let messageAdded = false;
      return OpenAIService.getInstance().chatCompletionStream({ messages: completionMessages }, (value) => {
        if (!messageAdded) {
          messageAdded = true;
          this.addMessage({ ...chatMessage, content: value });
        } else {
          this.updateMessage({ ...chatMessage, content: value });
        }
      });
    } catch (error) {
      this;
      let errorMessage = "Error requesting completion";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }
}
