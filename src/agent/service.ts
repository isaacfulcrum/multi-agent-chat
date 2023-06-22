import { AGENTS } from "./mock";
import { Agent } from "./type";
export class AgentService {
  private static instance: AgentService;
  agents: Agent[];
  currentAgent?: Agent;
  // Function triggered to notify the UI that the current agent has changed
  onAgentChanged?: () => void;

  // == Singleton =================================================================
  public static getInstance(): AgentService {
    if (!AgentService.instance) AgentService.instance = new AgentService();
    return AgentService.instance;
  }
  // == Lifecycle =================================================================
  protected constructor() {
    this.agents = AGENTS;
  }

  // == Public Methods ============================================================
  setCurrentAgent(id: string) {
    this.currentAgent = this.agents.find((agent) => agent.id === id);
    if (this.onAgentChanged) {
      this.onAgentChanged();
    }
  }
}

const AgentServiceInstance = AgentService.getInstance();
export default AgentServiceInstance;
