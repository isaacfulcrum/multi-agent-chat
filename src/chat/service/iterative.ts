import { OpenAIService } from "@/openai/service";
import { ConversationalAgent } from "@/agent/service";

import { AbstractChatService, ChatMode } from "../type";
import { createAgentMessage } from "../util";
import { AgentControllerService } from "@/agentController/service";

// == Iterative Agent Chat ========================================================

/** A chat service that evaluates the user's messages and selects the best agent
 * to respond to the user*/
// ********************************************************************************
export class IterativeAgentChat extends AbstractChatService {
  protected chatMode: ChatMode = ChatMode.Iterative; /*chat mode*/
  // == Lifecycle =================================================================
  public constructor() {
    super();
  }

  /** Iterative agent completion request,every agent will have a chance to respond
   * as they come in the order of the agent list */
  public async requestCompletion() {
    try {
      this.isLoading = true;
      const agentSpecList = await AgentControllerService.getInstance().getAgents();

      // for each agent in the list
      for await (const agentSpecs of agentSpecList) {
        // create the message
        const message = createAgentMessage("", agentSpecs);
        let messageAdded = false; /*add the message only when we have an actual response*/

        // agent
        const agent = new ConversationalAgent(agentSpecs.id, OpenAIService.getInstance());
        await agent.initialize();
        await agent.getResponse(this.getMessages(), (content) => {
          if (!messageAdded) {
            this.addMessage({ ...message, content });
            messageAdded = true; /*toggle flag so we don't add the message again*/
            return;
          }
          this.updateMessage({ ...message, content });
        });
      }
    } catch (error) {
      console.error(error);
      // Handle error with logs
    }
  }
}
