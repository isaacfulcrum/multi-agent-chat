import { lastValueFrom } from "rxjs";

import { agentOnceById$, agents$, agentsOnce$ } from "./observable";
import { createAgentRequest } from "./type";
import { createAgent } from "./callable";

/** All operations related to the agent list. It's only purpose is to interact directly with the
 * database, and to provide an observable of the agents list.*/
// ********************************************************************************
export class AgentControllerService {
  // == Singleton =================================================================
  private static singleton: AgentControllerService;
  public static getInstance() {
    if (!AgentControllerService.singleton) AgentControllerService.singleton = new AgentControllerService();
    return AgentControllerService.singleton;
  }
  // == Lifecycle =================================================================
  protected constructor() {}

  // == Agents List ===============================================================
  /* Returns an observable of the list of all current agents in the database */
  public onAgents$() {
    return agents$;
  }
  // -- Read -----------------------------------------------------------------------
  /** returns the list of all agents */
  public async getAgents() {
    return lastValueFrom(agentsOnce$);
  }

  /** return an agent by his id */
  public async getAgent(id: string) {
    return lastValueFrom(agentOnceById$(id)); // CHECK: should this be within the agent itself?
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
