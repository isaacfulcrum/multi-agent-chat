import { IAgent } from "@/agent/type";

import { AbstractChatService } from "./type";
import { createAgentMessage } from "./util";

/** A chat service that uses a single agent to respond to the user*/
// ********************************************************************************
export class SingleAgentChat extends AbstractChatService {
  // == Lifecycle =================================================================
  public constructor(private readonly chatAgent: IAgent) {
    super();
  }
  /** Initialize the agent who's going to respond to the user */
  protected async doInitialize(): Promise<void> {
    try {
      await this.chatAgent.initialize();
    } catch (e) {
      console.error(`Could not initialize single agent chat`, e);
    }
  }

  // == Completion ================================================================
  /** Single agent completion request */
  public async requestCompletion() {
    try {
      if (!this.chatAgent.isInitialized()) throw new Error(`Agent ${this.chatAgent} not initialized`);
      const agentSpecs = this.chatAgent.getSpecs();

      /*create the message*/
      const message = createAgentMessage("", agentSpecs);
      this.isLoading = true;
      let messageAdded = false; /*add the message only when we have an actual response*/

      await this.chatAgent.getResponse(this.getMessages(), (content) => {
        if (!messageAdded) {
          this.addMessage({ ...message, content });
          messageAdded = true; /*toggle flag so we don't add the message again*/
          return;
        }
        this.updateMessage({ ...message, content });
      });
      this.isLoading = false;
    } catch (error) {
      console.error(error);
      // Handle error with logs
    }
  }
}
