import { IAgent } from "@/agent/type";

import { AbstractChatService, ChatMode } from "../type";
import { createAgentMessage } from "../util";
import { OpenAIService } from "@/openai/service";
import { GenericAgent } from "@/agent/service";

export class SingleAgentChat extends AbstractChatService {
  protected chatMode: ChatMode = ChatMode.Single; /*chat mode*/
  protected chatAgent: IAgent; /*the agent that will be used to respond to the user*/

  // == Lifecycle =================================================================

  public constructor(protected readonly completionService: OpenAIService) {
    super(completionService);
    this.chatAgent = new GenericAgent(completionService);
  }

  protected async doInitialize(): Promise<void> {
    try {
      await this.chatAgent.initialize();
    } catch (e) {
      console.error(`Could not initialize agent ${this.chatAgent}`, e);
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
    } catch (e) {
      this.logger.error(e); /*log the error*/
      throw e;
    }
  }
}
