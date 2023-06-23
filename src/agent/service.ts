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

  // Stores the subscribers to the current agent
  /** listener to notify the UI that the current agent has changed */
  private readonly subscribers: ((agent: Agent | undefined) => void)[] = [];

  // == Lifecycle =================================================================
  protected constructor() {
    this.agents = [...AGENTS];
  }

  // == Public Methods ============================================================
  /** sets the current agent and emit the new agent to the subscribers */
  setCurrentAgent(id: string) {
    this.currentAgent = this.agents.find((agent) => agent.id === id);
    this.subscribers.forEach((subscriber) => subscriber(this.currentAgent));
  }

  // == Subscriptions =============================================================
  
  /** subscribes to changes on the current agent */
  onCurrentAgentChange(subscriber: (agent: Agent | undefined) => void) {
    this.subscribers.push(subscriber);
    //unsubscribe
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index !== -1) this.subscribers.splice(index, 1);
    };
  }
}

// ********************************************************************************
export const agentServiceInstance = AgentService.getInstance();
