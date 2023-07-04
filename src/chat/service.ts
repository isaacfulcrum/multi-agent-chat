import { BehaviorSubject, Subscription } from "rxjs";
import { nanoid } from "nanoid";

import { Agent } from "@/agent/type";
import { agentServiceInstance } from "@/agent/service";

import { fetchChatCompletionStream } from "./api";
import { chatMessageToCompletionMessage, AssistantChatMessage, ChatMessage, ChatMessageRoleEnum } from "./type";
import { ChatCompletionRequestMessage } from "openai";

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

  //** returns the current messages directly from the source */
  private getMessages() {
    return this.messages$.getValue();
  }

  /** returns the messages as openAI expects them */
  public getCompletionMessages() {
    return this.getMessages().map(chatMessageToCompletionMessage);
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
        .every((message) => message.role === ChatMessageRoleEnum.Assistant);
      if (isConsecutive) return /* nothing else to do */;


      const selectedAgent = await agentServiceInstance.selectAgent(messages);
      if (!selectedAgent) return /*nothing else to do*/;

      const lastMessageSentBySameAgent = messages.slice(-1)[0].name === selectedAgent.id;
      if (lastMessageSentBySameAgent) return /*nothing else to do*/;

      await this.runCompletion(messages, selectedAgent,() => {
        this.requestCompletion();
      });
    } catch (error) {
      // TODO: handle error
      console.error("Error:", error);
    }
  }

  /** runs the Completion with the current messages */
  public async runCompletion(messages: ChatCompletionRequestMessage[], agent?: Agent, onComplete?: () => void) {
    try {
      if (this.isLoading) return /*nothing else to do*/;
      this.isLoading = true;

      // NOTE: we use a copy of the messages so we don't modify the original array
      const messageHistory = [...messages]

      // -- New Message ------------------------------------------------------------
      const id = nanoid();
      let chatMessage: AssistantChatMessage = { id, role: ChatMessageRoleEnum.Assistant, content: "", isAgent: false };
      if (agent) {
        // If the agent exists, we add its description as a system message
        // NOTE: add to the start of the array so it's the first message
        const systemMessage = {
          role: ChatMessageRoleEnum.System,
          content: agent.description,
        };
        messageHistory.unshift(systemMessage);
        // NOTE: Add the agent to the message so we can display it in the UI
        chatMessage = { id, role: ChatMessageRoleEnum.Assistant, content: "", isAgent: true, agent };
      }

      this.addMessage(chatMessage);

      // Fetch the response from the OpenAI API and update the content of the message
      const completion$ = await fetchChatCompletionStream(messageHistory);
      if (!completion$) {
        throw new Error("Empty response");
      }
      // Subscribe to the stream
      this.completionSubscription = completion$.subscribe({
        // Update the message as we get new data from the stream
        next: (content) => {
          this.updateMessage({ ...chatMessage, content });
        },
        complete: onComplete,
        error: (error) => {
          throw error;
        },
      });
    } catch (error) {
      // TODO: handle error
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  // == Chat ======================================================================
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
}

// ********************************************************************************
export const chatServiceInstance = ChatService.getInstance();
