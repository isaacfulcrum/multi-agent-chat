import { BehaviorSubject, Subscription } from "rxjs";
import { nanoid } from "nanoid";

import { agentServiceInstance } from "@/agent/service";

import { fetchAgent, fetchChatCompletionStream } from "./api";
import { chatMessageToCompletionMessage, AssistantChatMessage, ChatMessage, ChatMessageRoleEnum } from "./type";
import { Agent } from "@/agent/type";
import { ChatFunctions } from "./function";
import { ChatCompletionRequestMessage } from "openai";

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

  // == Completion ================================================================
  /** 
  Selects an agent to keep the conversation flowing
  When NOT to run the Completion:
    1. If there are 5 consecutive messages from the assistant
    2. If the last message was sent by the selected agent
    3. If there was no agent returned 
  */
  public async continueChat() {
    try {
      // Check if the Completion is already running
      if (this.isLoading) return;
      this.isLoading = true;

      // NOTE: Check if there are 5 consecutive messages from assistant
      const lastMessages = this.getMessages().slice(-5);
      if (lastMessages.every((message) => message.role === ChatMessageRoleEnum.Assistant)) return;

      // Format messages as OpenAI expects them
      const messages = this.getMessages().map(chatMessageToCompletionMessage);

      const chatFunction = await fetchAgent(messages);
      if (!chatFunction) throw new Error("No function call was returned");

      // TODO: Find a better way to invoke the function, for now we just use an if
      if (chatFunction.name === ChatFunctions.runCompletion) {
        const args = JSON.parse(chatFunction.arguments ?? "{}");
        if (!args.agentId) return; /* no need to answer */

        // Check if the last message was sent by the selected agent
        const lastMessage = this.getMessages().slice(-1)[0];
        if (lastMessage.role === ChatMessageRoleEnum.Assistant) {
          if(args.agentId === "default" && !lastMessage.isAgent) return; /* the last message was sent by the default agent */
          if (lastMessage.isAgent && lastMessage.agent?.id === args.agentId) return; /* no need to answer */
        }

        // -- Run the Completion --------------------------------------------------
        await this.runCompletion(messages, args.agentId);
      }
    } catch (error) {
      // TODO: handle error
      console.error("Error:", error);
    } finally {
      this.isLoading = false;
    }
  }

  // == Private Methods ===========================================================
  /** runs the Completion with the current messages */
  public async runCompletion(messages: ChatCompletionRequestMessage[], agentId: string) {
    try {
      // New message
      const id = nanoid();
      let chatMessage: AssistantChatMessage = { id, role: ChatMessageRoleEnum.Assistant, content: "", isAgent: false };

      let agent: Agent | undefined;
      agent = agentServiceInstance.getAgent(agentId);
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
          this.continueChat();
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
