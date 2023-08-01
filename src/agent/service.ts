import { BehaviorSubject, lastValueFrom } from "rxjs";
import { ChatCompletionRequestMessage } from "openai";

import { Agent, createAgentRequest, fetchAgent } from "./type";
import { createAgent } from "./callable";
import { agentOnceById$, agents$, agentsOnce$ } from "./observable";

import { ChatMessage, ChatMessageRole, createAgentMessage } from "@/chat/type";
import { getRandomHex } from "@/utils/colors";
import { OpenAIService } from "@/openai/service";
import { nanoid } from "nanoid";

// ********************************************************************************

/** Agent */

type Response = {
  id: string;
  role: ChatMessageRole.Assistant;
  content: string;
  name: string;
};
interface IConversationalAgent {
  getResponse(messages: ChatMessage[]): Promise<Response>;
}

class ConversationalAgentAbstract implements IConversationalAgent {
  public readonly color: string;
  constructor(public readonly name: string, public readonly description: string) {
    this.color = getRandomHex();
  }

  public async getResponse(messages: ChatMessage[]): Promise<Response> {
    throw new Error("Method not implemented."); // Provide a default error for unimplemented methods
  }
}

export class ConversationalAgentOpenAI extends ConversationalAgentAbstract {
  constructor(public readonly id: string, name: string, description: string) {
    super(name, description);
  }

  public async getResponse(messages: ChatCompletionRequestMessage[]): Promise<Response> {
    const response = await OpenAIService.getInstance().chatCompletion({
      messages,
    });
    const content = response?.choices[0]?.message?.content ?? "";
    return { id: nanoid(), role: ChatMessageRole.Assistant, content, name: this.name };
  }
}
