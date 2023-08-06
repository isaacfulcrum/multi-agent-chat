import { nanoid } from "nanoid";
import { lastValueFrom } from "rxjs";

import { agentOnceById$ } from "@/agentController/observable";
import { OpenAIService } from "@/openai/service";
import { ConceptService } from "@/concept/service";

import { ChatMessage } from "@/chat/type";
import { createAgentMessage } from "@/chat/util";

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
    if (!this.agentSpecs) throw new Error(`Agent ${this.id} specs not found`);
    return this.agentSpecs;
  }
  // == Response ==================================================================
  abstract getResponse(messages: ChatMessage[], onUpdate: (incoming: string) => void): Promise<void | null>;
}

// ................................................................................
/** An agent without any personality, it just responds with a generic message */
export class GenericAgent extends AbstractAgent {
  // == Lifecycle =================================================================
  constructor(completionService: OpenAIService) {
    const id = nanoid();
    super(id, completionService);
  }

  protected async doInitialize(): Promise<void> {
    // Generic agent specs
    this.agentSpecs = {
      id: this.id,
      name: "Agent",
    };
  }

  // == Response ==================================================================
  public async getResponse(messages: ChatMessage[], onUpdate: (incoming: string) => void): Promise<void | null> {
    try {
      await this.completionService.chatCompletionStream({ messages }, onUpdate);
    } catch (error) {
      console.error("Error getting response from Completion Service: ", error);
      return null;
    }
  }
}

// ................................................................................
/** A conversational agent that uses a Completion Service to generate responses */
export class ConversationalAgent extends AbstractAgent {
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
  /** This method is used to get the completion from the Completion Service.
   * NOTE: It serves as an abstraction to reuse the code in {@link ConversationalAgentWithMemory}. */
  protected async getCompletion(messages: ChatMessage[], onUpdate: (incoming: string) => void): Promise<string> {
    const specs = this.getSpecs(); /*handles not found*/
    const systemMessage = isConversationalAgentSpecs(specs) ? specs.description : "";

    const completion = await this.completionService.chatCompletionStream({ messages, systemMessage }, onUpdate);
    if (!completion) throw new Error("No response from OpenAI API");
    return completion;
  }

  public async getResponse(messages: ChatMessage[], onUpdate: (incoming: string) => void): Promise<void | null> {
    try {
      const completion = await this.getCompletion(messages, onUpdate);
      if (!completion) throw new Error("No response from Completion Service");
    } catch (error) {
      console.error("Error getting response from OpenAI: ", error);
      return null;
    }
  }
}

// ................................................................................
/** A conversational agent that uses a Completion Service to generate responses and
 * a Concept Service to extract concepts from the conversation
 * NOTE: It extends from {@link ConversationalAgent}*/
export class ConceptualAgent extends ConversationalAgent {
  private conceptService = new ConceptService();

  // == Response ==================================================================
  public async getResponse(messages: ChatMessage[], onUpdate: (incoming: string) => void): Promise<void | null> {
    try {
      const completion = await this.getCompletion(messages, onUpdate);
      if (!completion) throw new Error("No response from Completion Service");

      // Concept extraction
      const specs = this.getSpecs(); /*handles not found*/
      // Assert that the specs are of type ConversationalAgentSpecs
      if (!isConversationalAgentSpecs(specs)) throw new Error(`Agent ${this.id} is not a Conversational Agent`);
  
      const newMessage = createAgentMessage(completion, specs);
      const newMessages = [...messages, newMessage]; /*add the new message to the list*/

      this.conceptService.extractConcepts(newMessages, specs);
    } catch (error) {
      console.error("Error getting response from OpenAI: ", error);
      return null;
    }
  }
}
