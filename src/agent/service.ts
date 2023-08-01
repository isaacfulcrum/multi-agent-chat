import { BehaviorSubject, lastValueFrom } from "rxjs";
import { ChatCompletionRequestMessage } from "openai";

import { Agent, createAgentRequest, fetchAgent } from "./type";
import { createAgent } from "./callable";
import { agentOnceById$, agents$, agentsOnce$ } from "./observable";

import { AssistantChatMessage, ChatMessage, ChatMessageRole, createAgentMessage } from "@/chat/type";
import { getRandomHex } from "@/utils/colors";
import { OpenAIService } from "@/openai/service";
import { nanoid } from "nanoid";

// ********************************************************************************

/** Agent */
interface IConversationalAgent {
  getResponse(messages: ChatMessage[]): Promise<AssistantChatMessage>;
}

class ConversationalAgentAbstract implements IConversationalAgent {
  public readonly color: string;
  constructor(public readonly name: string, public readonly description: string) {
    this.color = getRandomHex();
  }

  public async getResponse(messages: ChatMessage[]): Promise<AssistantChatMessage> {
    throw new Error("Method not implemented."); // Provide a default error for unimplemented methods
  }
}

export class ConversationalAgentOpenAI extends ConversationalAgentAbstract {
  constructor(public readonly id: string, name: string, description: string) {
    super(name, description);
  }

  public async getResponse(messages: ChatCompletionRequestMessage[]): Promise<AssistantChatMessage> {
    const response = await OpenAIService.getInstance().chatCompletion({
      messages,
    });
    const content = response?.choices[0]?.message?.content ?? "";
    return {
      id: nanoid(),
      role: ChatMessageRole.Assistant,
      content,
      agent: {
        id: this.id,
        name: this.name,
        color: this.color,
        description: this.description,
      },
    };
  }
}
