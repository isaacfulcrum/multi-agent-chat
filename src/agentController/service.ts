import { lastValueFrom } from "rxjs";

import { AgentIdentifier, ConversationalAgentSpecs } from "@/agent/type";
import { AbstractService } from "@/util/service";

import { CreateAgentRequest } from "./type";
import { createAgent, deleteAgent } from "./callable";
import { agentOnceById$, agents$, agentsOnce$ } from "./observable";

/** All operations related to the agent list. It's main purpose is to interact directly with the
 * database, and to provide an observable of the agents list.*/
// ********************************************************************************
export class AgentControllerService extends AbstractService {
  // == Singleton =================================================================
  private static singleton: AgentControllerService;
  public static getInstance() {
    if (!AgentControllerService.singleton) AgentControllerService.singleton = new AgentControllerService();
    return AgentControllerService.singleton;
  }
  // == Lifecycle =================================================================
  protected constructor() {
    super("Agent Controller Service");
  }

  // -- Read -----------------------------------------------------------------------
  /* Returns an observable of the list of all current agents in the database */
  public onAgents$() {
    return agents$;
  }

  /** returns the list of all agents */
  public async getAgents() {
    return lastValueFrom(agentsOnce$());
  }

  /** return an agent by his id */
  public async getAgent(id: AgentIdentifier): Promise<ConversationalAgentSpecs> {
    try {
      return lastValueFrom(agentOnceById$(id)); // CHECK: should this be within the agent itself?
    } catch (e) {
      this.logger.error(e);
      throw new Error(`Error getting agent`); /*for the ui*/
    }
  }

  // -- Write ---------------------------------------------------------------------
  /** Saves a new agent to the database */
  public async newAgent(agent: CreateAgentRequest) {
    try {
      await createAgent(agent);
    } catch (e) {
      this.logger.error(e);
      throw new Error(`Error creating agent`); /*for the ui*/
    }
  }

  /** Deletes an agent from the database */
  public async deleteAgent(agentId: AgentIdentifier) {
    try {
      await deleteAgent(agentId);
    } catch (e) {
      this.logger.error(e);
      throw new Error(`Error deleting agent`); /*for the ui*/
    }
  }
}
