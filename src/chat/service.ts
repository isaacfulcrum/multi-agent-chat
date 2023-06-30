import { BehaviorSubject, Subscription } from "rxjs";
import { nanoid } from "nanoid";

import { Agent } from "@/agent/type";
import { agentServiceInstance } from "@/agent/service";

import { fetchAgent, fetchChatCompletionStream } from "./api";
import { chatMessageToCompletionMessage, AssistantChatMessage, ChatMessage, ChatMessageRoleEnum } from "./type";
import { ChatFunctions } from "./function";
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

  // == Private Methods ===========================================================
  //** returns the current messages directly from the source */
  private getMessages() {
    return this.messages$.getValue();
  }

  // == Agent =====================================================================
  /** Semantically chooses an Agent based on a history of messages and the Agent's
   *  description */
  private async selectAgent(messages: ChatCompletionRequestMessage[], agents: Agent[]): Promise<Agent | null/*not found*/> {
    const chatFunction = await fetchAgent(messages, agents);
    if (!chatFunction) throw new Error("No function call was returned");

    // TODO: Find a better way to invoke the function, for now we just use an if
    if (chatFunction.name !== ChatFunctions.runCompletion) throw new Error("Invalid function call");
    const args = JSON.parse(chatFunction.arguments ?? "{}");
    if (!args.agentId) return null;

    // Check if the last message was sent by the selected agent
    const lastMessage = this.getMessages().slice(-1)[0];
    if (lastMessage.role === ChatMessageRoleEnum.Assistant) {
      if(args.agentId === "default" && !lastMessage.isAgent) return null;
      if (lastMessage.isAgent && lastMessage.agent?.id === args.agentId) return null;
    }

    return agentServiceInstance.getAgent(args.agentId) ?? null;
  };

  // == Completion ================================================================
  /** Select an Agent to respond to the conversation based on the Context and Agent 
   *  description.
   *  Respond based on the following conditions:
   *  1. The previous {@link MAX_CONSECUTIVE_ASSISTANT_MESSAGES } messages where not
   *     sent exclusively by the assistant.
   *  2. An agent cannot respond consecutively. */
  public async requestCompletion() {
    try {
      if (this.isLoading) return/*nothing else to do*/;
      this.isLoading = true;

      const isConsecutive = this.getMessages()
        .slice(-MAX_CONSECUTIVE_ASSISTANT_MESSAGES)
        .every((message) => message.role === ChatMessageRoleEnum.Assistant);
      if(isConsecutive) return/* nothing else to do */;

      // Format messages as OpenAI expects them
      const messages = this.getMessages().map(chatMessageToCompletionMessage);

      const selectedAgent = await this.selectAgent(messages, agentServiceInstance.getActiveAgents());
      if(!selectedAgent) return/*nothing else to do*/;

      await this.runCompletion(messages, selectedAgent);
    } catch (error) {
      // TODO: handle error
      console.error("Error:", error);
    } finally {
      this.isLoading = false;
    }
  }

  /** runs the Completion with the current messages */
  public async runCompletion(messages: ChatCompletionRequestMessage[], agent?: Agent) {
    try {
      // New message
      const id = nanoid();
      let chatMessage: AssistantChatMessage = { id, role: ChatMessageRoleEnum.Assistant, content: "", isAgent: false };
      // If the agent exists, we add its description as a system message
      // NOTE: add to the start of the array so it's the first message
      if (agent) {
        messages.unshift({ role: ChatMessageRoleEnum.System, content: agent.description });
        // NOTE: Add the agent to the message so we can display it in the UI
        chatMessage = { id, role: ChatMessageRoleEnum.Assistant, content: "", isAgent: true, agent };
      }

      this.isLoading = true;
      this.addMessage(chatMessage);

      // Fetch the response from the OpenAI API and update the content of the message
      const completion$ = await fetchChatCompletionStream(messages);
      if (!completion$) {
        throw new Error("Empty response");
      }
      // Subscribe to the stream
      this.completionSubscription = completion$.subscribe({
        // Update the message as we get new data from the stream
        next: (content) => {
          this.updateMessage({ ...chatMessage, content });
        },
        complete: () => {
          // When the stream is completed, evaluate if we need to continue the chat
          this.requestCompletion();
        },
        error: (error) => {
          throw error;
        },
      });
    } catch (error) {
      // TODO: handle error
      console.error(error);
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
