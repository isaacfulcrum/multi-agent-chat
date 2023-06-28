import { BehaviorSubject, Observable } from "rxjs";
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
  public agents: Agent[];
  public currentAgent?: Agent;

  /** current agent updates sent to the subscribers */
  // NOTE: we use a BehaviorSubject so the subscribers get the last value when they subscribe
  public readonly onCurrentAgentUpdate$: BehaviorSubject<Agent | undefined>;

  // == Lifecycle =================================================================
  protected constructor() {
    this.agents = [...AGENTS];
    this.onCurrentAgentUpdate$ = new BehaviorSubject(this.currentAgent);
  }

  // == Public Methods ============================================================
  /** sets the current agent and emit the new agent to the subscribers */
  setCurrentAgent(id: string) {
    this.currentAgent = this.agents.find((agent) => agent.id === id);
    this.onCurrentAgentUpdate$.next(this.currentAgent);
  }

  /** return agent list */
  getAgents() {
    return this.agents;
  }

  /** return an agent by his id */
  getAgent(id: string) {
    return this.agents.find((agent) => agent.id === id);
  }
}

// ********************************************************************************
export const agentServiceInstance = AgentService.getInstance();
