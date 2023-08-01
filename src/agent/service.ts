import { ChatCompletionRequestMessage } from "openai";

import { AssistantChatMessage, ChatMessage, ChatMessageRole, createAgentMessage } from "@/chat/type";
import { OpenAIService } from "@/openai/service";

// ********************************************************************************
interface IConversationalAgent {
  /** creates a new message from the agent */
  createNewMessage(): AssistantChatMessage;
  /** gets a response from the agent */
  getResponse(messages: ChatMessage[], onUpdate: (incoming: string) => void): Promise<void | null>;
}

class ConversationalAgentAbstract implements IConversationalAgent {
  constructor(protected readonly id: string, protected readonly name: string, protected readonly description: string, protected readonly color: string) {}

  public createNewMessage(): AssistantChatMessage {
    return createAgentMessage("" /*empty*/, {
      /* TODO: Maybe the message stuff is better managed by the chat */
      id: this.id,
      name: this.name,
      color: this.color,
      description: this.description,
    });
  }

  public async getResponse(messages: ChatCompletionRequestMessage[], onUpdate: (incoming: string) => void): Promise<void | null> {
    /*template method*/
  }
}

/** A conversational agent that uses OpenAI's API to generate responses */
export class ConversationalAgentOpenAI extends ConversationalAgentAbstract {
  constructor(public readonly id: string, name: string, description: string, color: string) {
    /* TODO: maybe only the id and search for this info in firebase */
    super(id, name, description, color);
  }

  public async getResponse(messages: ChatCompletionRequestMessage[], onUpdate: (incoming: string) => void): Promise<void | null> {
    const systemPrompt: ChatCompletionRequestMessage = {
      role: ChatMessageRole.System,
      content: this.description,
    };
    return OpenAIService.getInstance().chatCompletionStream({ messages: [systemPrompt, ...messages] }, onUpdate);
  }
}
