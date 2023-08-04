import { lastValueFrom } from "rxjs";

import { agentOnceById$ } from "@/agentController/observable";
import { OpenAIService } from "@/openai/service";
import { ConceptService } from "@/concept/service";
import { ChatMessage, ChatMessageRole } from "@/chat/type";

import { AgentIdentifier, AgentSpecs, IAgent, isConversationalAgentSpecs } from "./type";
import { AbstractService } from "@/util/service";

// ********************************************************************************
abstract class AbstractAgent extends AbstractService implements IAgent {
  // == Lifecycle =================================================================
  constructor(protected readonly id: AgentIdentifier, protected readonly completionService: OpenAIService) {
    super("Agent " + id);
  }
  // == Spec ======================================================================
  protected agentSpecs: AgentSpecs | null = null;
  public getSpecs(): AgentSpecs {
    if (!this.agentSpecs) throw new Error(`Agent ${this.id} not found`);
    return this.agentSpecs;
  }
  // == Response ==================================================================
  abstract getResponse(messages: ChatMessage[], onUpdate: (incoming: string) => void): Promise<void | null>;
}

/** A conversational agent that uses OpenAI's API to generate responses */
export class ConversationalAgent extends AbstractAgent {
  private conceptService = new ConceptService();

  // == Lifecycle =================================================================
  constructor(id: AgentIdentifier, completionService: OpenAIService) {
    super(id, completionService);
  }

  /** Initializes the agent by getting its specs from the database */
  protected async doInitialize(): Promise<void> {
    try {
      const specs = await lastValueFrom(agentOnceById$(this.id));
      if (!specs) throw new Error(`Agent ${this.id} not found`);
      this.agentSpecs = specs;
    } catch (e) {
      console.error(`Could not initialize agent ${this.id}`, e);
    }
  }

  // == Response ==================================================================
  public async getResponse(messages: ChatMessage[], onUpdate: (incoming: string) => void): Promise<void | null> {
    try {
      const specs = this.getSpecs(); /*handles not found*/
      const description = isConversationalAgentSpecs(specs) ? specs.description : "";

      const completion = await this.completionService.chatCompletionStream(
        {
          messages,
          systemMessage: description,
        },
        onUpdate
      );
      if (!completion) throw new Error("No response from OpenAI API");

      // Concept extraction
      // this.conceptService.extractConcepts(
      //   [
      //     ...messages,
      //     {
      //       role: ChatMessageRole.Assistant,
      //       name: specs.id,
      //       content: completion,
      //     },
      //   ],
      //   specs
      // );
    } catch (error) {
      console.error("Error getting response from OpenAI: ", error);
      return null;
    }
  }
}
