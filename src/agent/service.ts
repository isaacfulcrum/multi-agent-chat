import { nanoid } from "nanoid";
import { lastValueFrom } from "rxjs";

import { agentOnceById$ } from "@/agentController/observable";
import { OpenAIService } from "@/openai/service";
import { ConceptService } from "@/concept/service";

import { ChatMessage } from "@/chat/type";
import { createAgentMessage } from "@/chat/util";

import { AgentIdentifier, AgentSpecs, AgentType, ConversationalAgentSpecs, IAgent, isConversationalAgentSpecs } from "./type";
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
  abstract getResponse(messages: ChatMessage[], onUpdate: (incoming: string) => void): Promise<void>;
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
  public async getResponse(messages: ChatMessage[], onUpdate: (incoming: string) => void) {
    await this.completionService.chatCompletionStream({ messages }, onUpdate);
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
      this.logger.error(e);
      throw new Error(`Could not initialize agent ${this.id}`);
    }
  }

  // == Response ==================================================================
  /** This method is used to get the completion from the Completion Service.
   * NOTE: It serves as an abstraction to reuse the code in {@link ConversationalAgentWithMemory}. */
  protected async getCompletion(messages: ChatMessage[], onUpdate: (incoming: string) => void): Promise<string> {
    const specs = this.getSpecs(); /*handles not found*/
    const systemMessage = isConversationalAgentSpecs(specs) ? specs.description : "";

    return this.completionService.chatCompletionStream({ messages, systemMessage }, onUpdate);
  }

  public async getResponse(messages: ChatMessage[], onUpdate: (incoming: string) => void) {
    await this.getCompletion(messages, onUpdate);
  }
}

// ................................................................................
/** A conversational agent that uses a Completion Service to generate responses and
 * a Concept Service to extract concepts from the conversation
 * NOTE: It extends from {@link ConversationalAgent}*/
export class ConceptualAgent extends ConversationalAgent {
  private conceptService = new ConceptService(this.id);

  // == Response ==================================================================
  public async getResponse(messages: ChatMessage[], onUpdate: (incoming: string) => void) {
    const completion = await this.getCompletion(messages, onUpdate);

    // Concept extraction
    const specs = this.getSpecs(); /*handles not found*/
    // Assert that the specs are of type ConversationalAgentSpecs
    if (!isConversationalAgentSpecs(specs)) throw new Error(`Agent ${this.id} is not a Conversational Agent`);

    const newMessage = createAgentMessage(completion, specs);
    const newMessages = [...messages, newMessage]; /*add the new message to the list*/
    
    // NOTE: This will not be awaited, it will be done in the background
    this.conceptService.extractConcepts(newMessages, specs);
  }
}

// == Factory ====================================================================
// ................................................................................
/** instantiates an agent based on its type */
export function createAgent(agentSpecs: ConversationalAgentSpecs | null, completionService: OpenAIService): IAgent {
  if (!agentSpecs) return new GenericAgent(completionService);
  const { id, type } = agentSpecs;
  switch (type) {
    case AgentType.Conceptual:
      return new ConceptualAgent(id, completionService);
    case AgentType.Conversational:
      return new ConversationalAgent(id, completionService);
    default:
      throw new Error(`Agent type ${type} not found`);
  }
}
