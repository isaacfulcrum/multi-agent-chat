import { BehaviorSubject, Subscription } from "rxjs";
import { ChatCompletionRequestMessage } from "openai";

import { Agent } from "@/agent/type";
import { agentServiceInstance } from "@/agent/service";

import { fetchChatCompletionStream } from "./api";
import { chatMessageToCompletionMessage, AssistantChatMessage, ChatMessage, ChatMessageRole, createAssistantMessage, createAgentMessage } from "./type";

const MAX_CONSECUTIVE_ASSISTANT_MESSAGES = 5;

// ********************************************************************************
export class ChatService {
  // == Singleton =================================================================
  private static instance: ChatService;
  public static getInstance(): ChatService {
    if (!ChatService.instance) ChatService.instance = new ChatService();
    return ChatService.instance;
  }

  // ------------------------------------------------------------------------------
  /** stream of chat messages sent to the subscribers */
  // NOTE: we use a BehaviorSubject so the subscribers get the last value when they subscribe
  private messages$: BehaviorSubject<ChatMessage[]>;
  public onMessage$ = () => this.messages$;

  /** this subscription is used when there's an incoming message from the agent, it's used to update the chat
   * NOTE: In case the chat is closed before the completion is done use the unmout() method */
  private completionSubscription: Subscription | undefined;

  /** indicates if the Completion is being run */
  public isLoading: boolean = false;

  // == Lifecycle =================================================================
  protected constructor() {
    this.messages$ = new BehaviorSubject<ChatMessage[]>([]);
  }

  // NOTE: call this if the chat instance is going to be destroyed
  public unmount() {
    // Unsuscribe from the completion stream
    if (this.completionSubscription) {
      this.completionSubscription.unsubscribe();
      this.completionSubscription = undefined;
    }
  }

  // == Chat ======================================================================
  //** returns the current messages directly from the source */
  private getMessages() {
    return this.messages$.getValue();
  }

  /** returns the messages as OpenAI expects them */
  public getCompletionMessages() {
    return this.getMessages().map(chatMessageToCompletionMessage);
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
  /** Select an Agent to respond to the conversation based on the Context and Agent
   *  description.
   *  Respond based on the following conditions:
   *  1. The previous {@link MAX_CONSECUTIVE_ASSISTANT_MESSAGES } messages where not
   *     sent exclusively by the assistant.
   *  2. An agent cannot respond consecutively. */
  public async requestCompletion() {
    try {
      if (this.isLoading) return /*nothing else to do*/;
      const messages = this.getCompletionMessages();
      const isConsecutive = messages /* get the original messages because we need the role */
        .slice(-MAX_CONSECUTIVE_ASSISTANT_MESSAGES)
        .every((message) => message.role === ChatMessageRole.Assistant);
      if (isConsecutive) return /* nothing else to do */;

      const selectedAgent = await agentServiceInstance.selectAgent(messages);
      if (!selectedAgent) return /*nothing else to do*/;

      const lastMessageSentBySameAgent = messages.slice(-1)[0].name === selectedAgent.id;
      if (lastMessageSentBySameAgent) return /*nothing else to do*/;

      await this.runCompletion(messages, selectedAgent, () => {
        this.requestCompletion();
      });
    } catch (error) {
      // TODO: handle error
      console.error("Error:", error);
    }
  }

  /** Requests a completion to the OpenAI API and updates the message with the response
   * @param messages the history the completion will be based on
   * @param agent an optional agent that will be the one responding to the completion.
   *       If no agent is passed, no system message will be added.
   * @param onComplete an optional callback that will be called once the stream is completed.
   *       This can be used in recursive calls to request a completion based on the previous
   */
  public async runCompletion(messages: ChatCompletionRequestMessage[], agent?: Agent, onComplete?: () => void) {
    try {
      if (!messages) return;
      if (this.isLoading) return /*nothing else to do*/;

      this.isLoading = true;
      const messageHistory = [...messages];

      let chatMessage: AssistantChatMessage = createAssistantMessage();
      if (agent) {
        /* NOTE: add to the start of the array so it's the first message. */
        const systemMessage = { role: ChatMessageRole.System, content: agent.description };
        messageHistory.unshift(systemMessage);
        chatMessage = createAgentMessage("", agent);
      }

      this.addMessage(chatMessage);
      const completion$ = await fetchChatCompletionStream(messageHistory);
      if (!completion$) {
        throw new Error("Empty response");
      }

      /* subscribe to the stream */
      this.completionSubscription = completion$.subscribe({
        next: (content) => {
          this.updateMessage({ ...chatMessage, content });
        },
        complete: () => {
          this.isLoading = false;
          if (onComplete) onComplete(); /* on complete callback */
        },
        error: (error) => {
          throw error;
        },
      });
    } catch (error) {
      // TODO: handle error
      console.error(error);
      this.isLoading = false;
    }
  }
}

// ********************************************************************************
export const chatServiceInstance = ChatService.getInstance();
