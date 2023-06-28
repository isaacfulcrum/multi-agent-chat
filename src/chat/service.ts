import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { nanoid } from "nanoid";

import { agentServiceInstance } from "@/agent/service";

import { fetchChatCompletionStream } from "./api";
import { chatMessageToCompletionMessage, AssistantChatMessage, ChatMessage, ChatMessageRoleEnum, CompletionType } from "./type";
import { Agent } from "@/agent/type";

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
  private messages$: BehaviorSubject<ChatMessage[]>;
  public onMessage$ = () => this.messages$;

  /** completion stream */
  private completionSubscription: Subscription | undefined;

  /** indicates if the Completion is being run */
  public isLoading: boolean = false;

  // == Lifecycle =================================================================
  protected constructor() {
    this.messages$ = new BehaviorSubject<ChatMessage[]>([]);
  }

  protected unmount() {
    if (this.completionSubscription) {
      this.completionSubscription.unsubscribe();
      this.completionSubscription = undefined;
    }
  }

  // == Private Methods ===========================================================
  private getMessages() {
    return this.messages$.getValue();
  }

  // == Public Methods ============================================================
  /** runs the Completion with the current messages */
  public async runCompletion(agentId?: string) {
    try {
      // Check if the Completion is already running
      if (this.isLoading) return;

      // Format messages as OpenAI expects them
      const formattedMessages = this.getMessages().map(chatMessageToCompletionMessage);

      // New message
      const id = nanoid();
      let chatMessage: AssistantChatMessage = { id, role: ChatMessageRoleEnum.Assistant, content: "", isAgent: false };

      let agent: Agent | undefined;
      if (agentId) {
        agent = agentServiceInstance.getAgent(agentId);
        // If the agetn exists, we add its description as a system message
        // NOTE: add to the start of the array so it's the first message
        if (agent) {
          formattedMessages.unshift({ role: ChatMessageRoleEnum.System, content: agent.description });
          // NOTE: Add the agent to the message so we can display it in the UI
          chatMessage = { id, role: ChatMessageRoleEnum.Assistant, content: "", isAgent: true, agent };
        }
      }

      this.isLoading = true;
      this.addMessage(chatMessage);

      // Fetch the response from the OpenAI API and update the content of the message
      const completion$ = await fetchChatCompletionStream(formattedMessages);
      if (!completion$) {
        throw new Error("Empty response");
      }
      // Subscribe to the stream
      this.completionSubscription = completion$.subscribe({
        // Update the message as we get new data from the stream
        next: (content) => {
          if (content.type === CompletionType.message) {
            this.updateMessage({ ...chatMessage, content: content.message });
          } else if (content.type === CompletionType.function) {

            console.log(JSON.parse(content.functionCall.arguments));
            this.updateMessage({ ...chatMessage, content: content.functionCall.arguments });
          }
        },
        // On complete event
        complete: () => {
        },
        error: (error) => {
          throw error;
        },
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
    this.messages$.next(this.getMessages().map((m) => (m.id === message.id ? message : m)));
  }

  /** removes the message from the chat */
  public async removeMessage(messageId: string) {
    this.messages$.next(this.getMessages().filter((m) => m.id !== messageId));
  }
}

// ********************************************************************************
export const chatServiceInstance = ChatService.getInstance();
