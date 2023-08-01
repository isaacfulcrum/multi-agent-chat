import { ChatCompletionRequestMessage } from "openai";

import { AssistantChatMessage, ChatMessage, createAgentMessage } from "@/chat/type";
import { getRandomHex } from "@/utils/colors";
import { OpenAIService } from "@/openai/service";
import { nanoid } from "nanoid";

// ********************************************************************************

/** Agent */
interface IConversationalAgent {
  createNewMessage(): AssistantChatMessage;
  getResponse(messages: ChatMessage[], onUpdate: (incoming: string) => void): Promise<void | null>;
}

class ConversationalAgentAbstract implements IConversationalAgent {
  public readonly color: string;
  constructor(public readonly name: string, public readonly description: string) {
    this.color = getRandomHex();
  }

  public createNewMessage(): AssistantChatMessage {
    return createAgentMessage("" /*empty*/, {
      id: nanoid(),
      name: this.name,
      color: this.color,
      description: this.description,
    });
  }

  public async getResponse(messages: ChatCompletionRequestMessage[], onUpdate: (incoming: string) => void): Promise<void | null> {
    throw new Error("Method not implemented."); // Provide a default error for unimplemented methods
  }
}

export class ConversationalAgentOpenAI extends ConversationalAgentAbstract {
  constructor(public readonly id: string, name: string, description: string) {
    super(name, description);
  }

  public async getResponse(messages: ChatCompletionRequestMessage[], onUpdate: (incoming: string) => void): Promise<void | null> {
    return OpenAIService.getInstance().chatCompletionStream({ messages }, onUpdate);
  }
}
