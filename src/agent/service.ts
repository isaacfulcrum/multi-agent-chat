import { BehaviorSubject, lastValueFrom, map } from "rxjs";
import { ChatCompletionRequestMessage } from "openai";

import { Agent, createAgentRequest, fetchAgent } from "./type";
import { createAgent } from "./callable";
import { agentOnceById$, agents$, agentsOnce$ } from "./observable";

import { ChatMessageRole } from "@/chat/type";
import { moderatorDescription } from "@/chat/function";

// ********************************************************************************
/** Manages all agent related tasks on the app */
export class AgentService {
  private static instance: AgentService; // singleton
  public static getInstance(): AgentService {
    if (!AgentService.instance) AgentService.instance = new AgentService();
    return AgentService.instance;
  }
  // ------------------------------------------------------------------------------
  /* Returns an observable of the list of all current agents in the database */
  public onAgents$() {
    return agents$;
  }
  private selectedAgent$: BehaviorSubject<Agent | undefined>;
  /** Returns an observable of the selected agent */
  public onSelectedAgent$() {
    return this.selectedAgent$;
  }

  // == Lifecycle =================================================================
  protected constructor() {
    this.selectedAgent$ = new BehaviorSubject<Agent | undefined>(undefined);
  }

  // == Active agent ==============================================================
  /** Semantically chooses an Agent based on a history of messages and the Agent's
   *  description */
  public async selectAgent(messages: ChatCompletionRequestMessage[]): Promise<Agent | null /*not found*/> {
    try {
      const agentList = await this.getAgents();
      // Message with the description of the agents
      const systemMessage = {
        role: ChatMessageRole.System,
        content: moderatorDescription + JSON.stringify(agentList),
      };

      const agentSelection = await fetchAgent([systemMessage, ...messages]);
      if (!agentSelection) return null;

      const args = JSON.parse(agentSelection ?? "{}");
      if (!args.agentId) return null;

      const agent = await this.getAgent(args.agentId);
      return agent;
    } catch (error) {
      throw new Error(`Error selecting agent: ${error}`);
    }
  }
  /** return the selected agent */
  public getSelectedAgent() {
    return this.selectedAgent$.getValue();
  }
  /** set the selected agent */
  public async setSelectedAgent(agentId: string) {
    const agent = await this.getAgent(agentId);
    this.selectedAgent$.next(agent);
  }

  // == Agent List ================================================================

  // -- Read -----------------------------------------------------------------------
  /** returns the list of all agents */
  public async getAgents() {
    return lastValueFrom(agentsOnce$);
  }

  /** return an agent by his id */
  public async getAgent(id: string) {
    return lastValueFrom(agentOnceById$(id));
  }

  // -- Write ---------------------------------------------------------------------
  /** Saves a new agent to the database */
  public async newAgent(agent: createAgentRequest) {
    try {
      await createAgent(agent);
    } catch (error) {
      throw new Error(`Error creating agent: ${error}`);
    }
  }
}

// ********************************************************************************
export const agentServiceInstance = AgentService.getInstance();
