import { lastValueFrom } from "rxjs";
import { ChatCompletionRequestMessage } from "openai";

import { agentOnceById$ } from "@/agentController/observable";
import { OpenAIService } from "@/openai/service";
import { ConceptService } from "@/concept/service";
import { ChatMessageRole } from "@/chat/type";

import { AgentIdentifier, AgentProfile, IAgent } from "./type";

// ********************************************************************************
class ConversationalAgentAbstract implements IAgent {
  /** Service to store and access */
  protected conceptService: ConceptService = new ConceptService(this);
  constructor(protected readonly id: AgentIdentifier) {}

  public async getProfile(): Promise<AgentProfile> {
    try {
      const agent = await lastValueFrom(agentOnceById$(this.id));
      if (!agent?.name) throw new Error(`Agent ${this.id} not found`); // TODO: type assertion
      return agent;
    } catch (error) {
      throw new Error("Error getting agent profile: " + error);
    }
  }

  public async getResponse(messages: ChatCompletionRequestMessage[], onUpdate: (incoming: string) => void): Promise<void | null> {
    /*template method*/
  }
}

/** A conversational agent that uses OpenAI's API to generate responses */
export class ConversationalAgentOpenAI extends ConversationalAgentAbstract {
  constructor(id: AgentIdentifier) {
    super(id);
  }
  public async getResponse(messages: ChatCompletionRequestMessage[], onUpdate: (incoming: string) => void): Promise<void | null> {
    try {
      const profile = await this.getProfile();

      const systemPrompt: ChatCompletionRequestMessage = {
        role: ChatMessageRole.System,
        content: profile.description,
      };

      const completion = await OpenAIService.getInstance().chatCompletionStream({ messages: [systemPrompt, ...messages] }, onUpdate);
      if (!completion) throw new Error("No response from OpenAI API");

      // Concept extraction
      this.conceptService.extractConcepts([
        ...messages,
        {
          role: ChatMessageRole.Assistant,
          name: profile.id,
          content: completion,
        },
      ]);
    } catch (error) {
      console.error("Error getting response from OpenAI: ", error);
      return null;
    }
  }
}
