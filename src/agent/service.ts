import { BehaviorSubject } from "rxjs";
import { ChatCompletionRequestMessage } from "openai";

import { Agent } from "./type";
import { AGENTS } from "./mock";

import { ChatMessageRoleEnum } from "@/chat/type";
import { moderatorDescription } from "@/chat/function";
import { fetchAgent } from "@/chat/api";

// ********************************************************************************
export class AgentService {
  private static instance: AgentService;
  public static getInstance(): AgentService {
    if (!AgentService.instance) AgentService.instance = new AgentService();
    return AgentService.instance;
  }
  // ------------------------------------------------------------------------------
  private agents$: BehaviorSubject<Agent[]>;
  public onAgents$ = () => this.agents$;

  private selectedAgent$: BehaviorSubject<Agent | null>;
  public onSelectedAgent$ = () => this.selectedAgent$;

  // == Lifecycle =================================================================
  protected constructor() {
    this.agents$ = new BehaviorSubject(AGENTS);
    this.selectedAgent$ = new BehaviorSubject<Agent | null>(null);
  }

  // == Agent =====================================================================
  /** Semantically chooses an Agent based on a history of messages and the Agent's
   *  description */
  public async selectAgent(messages: ChatCompletionRequestMessage[]): Promise<Agent | null/*not found*/> {

    // Message with the description of the agents
    const systemMessage = {
      role: ChatMessageRoleEnum.System,
      content: moderatorDescription + JSON.stringify(agentServiceInstance.getActiveAgents()),
    };

    const agentSelection = await fetchAgent([systemMessage, ...messages]);

    if (!agentSelection) return null;
    
    const args = JSON.parse(agentSelection ?? "{}");
    if (!args.agentId) return null;

    return agentServiceInstance.getAgent(args.agentId) ?? null;
  };


  // == Public Methods ============================================================

  /** return the selected agent */
  public getSelectedAgent() {
    return this.selectedAgent$.getValue();
  }

  /** set the selected agent */
  public setSelectedAgent(agent: Agent | null) {
    this.selectedAgent$.next(agent);
  }

  /** return agent list */
  public getAgents() {
    return this.agents$.getValue();
  }

  /** return active agent list */
  public getActiveAgents() {
    return this.agents$.getValue().filter((agent) => agent.isActive);
  }

  /** return an agent by his id */
  public getAgent(id: string) {
    return this.getAgents().find((agent) => agent.id === id);
  }

  /** update an agent based on his id */
  public updateAgent(agent: Agent) {
    const agents = [...this.getAgents()];
    const index = agents.findIndex((a) => a.id === agent.id);
    if(index === -1) return;
    agents[index] = agent;
    this.agents$.next(agents);
  }
}

// ********************************************************************************
export const agentServiceInstance = AgentService.getInstance();
