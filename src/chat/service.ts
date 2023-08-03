import { ConversationalAgentOpenAI } from "@/agent/service";

import { AbstractChatService } from "./type";
import { chatMessagesToCompletionMessages, createAgentMessage } from "./util";

/** A chat service that uses a single agent to respond to the user*/
// ********************************************************************************
export class SingleAgentChat extends AbstractChatService {
  // == Singleton =================================================================
  private static singleton: SingleAgentChat;
  public static getInstance() {
    if (!SingleAgentChat.singleton) SingleAgentChat.singleton = new SingleAgentChat();
    return SingleAgentChat.singleton;
  }

  // == Lifecycle =================================================================
  protected constructor() {
    super();
  }

  // == Completion ================================================================
  /** Single agent completion request, in this mode the selected agent in XXX will
   * be the one responding*/
  public async requestCompletion() {
    try {
      /*get the selected agent from XXX*/
      const agent = new ConversationalAgentOpenAI("1");
      const AgentProfile = await agent.getProfile();
      if (!AgentProfile) throw new Error(`Agent ${agent} not found`); // TODO: maybe this should be handled by getProfile()

      /*create the message*/
      const message = createAgentMessage("", AgentProfile);
      this.isLoading = true;
      let messageAdded = false; /*add the message only when we have an actual response*/
      await agent.getResponse(chatMessagesToCompletionMessages(this.getMessages()), (content) => {
        if (!messageAdded) {
          this.addMessage({ ...message, content });
          messageAdded = true;
          return;
        }
        this.updateMessage({ ...message, content });
      });
      this.isLoading = false;
    } catch (error) {
      console.error(error);
      // Handle error
    } finally {
    }
  }
}
