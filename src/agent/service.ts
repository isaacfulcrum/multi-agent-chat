import { BehaviorSubject } from "rxjs";
import { AGENTS } from "./mock";
import { Agent } from "./type";

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

  // == Lifecycle =================================================================
  protected constructor() {
    this.agents$ = new BehaviorSubject(AGENTS);
  }

  // == Public Methods ============================================================
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
