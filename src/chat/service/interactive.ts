import { IAgent } from "@/agent/type";
import { createAgent } from "@/agent/service";
import { AgentControllerService } from "@/agentController/service";
import { OpenAIService } from "@/openai/service";

import { AbstractChatService, ChatMessage, ChatMessageRole, ChatMode } from "../type";
import { ChatFunctions, chatFunctions, getModeratorPrompt, moderatorDescription } from "../function";
import { createAgentMessage } from "../util";

// ********************************************************************************
const MAX_CONSECUTIVE_ASSISTANT_MESSAGES = 5;
const openai = new OpenAIService();

/** A chat service that evaluates the user's messages and selects the best agent
 * to respond to the user*/
export class InteractiveAgentChat extends AbstractChatService {
  protected chatMode = ChatMode.Interactive; /*chat mode*/

  // == Completion ================================================================
  /** Semantically chooses an Agent based on a history of messages and the Agent's description */
  public async selectAgent(messages: ChatMessage[]): Promise<IAgent> {
    const agentList = await AgentControllerService.getInstance().getAgents();
    /* TODO: This prompt will be handled by a tool similar to an Agent,
     * that way this function won't interact directly with the OpenAI API */
    const prompt = getModeratorPrompt(messages, agentList);

    // NOTE: Purposefully using openAI because this is a function-based completion
    const response = await openai.chatCompletion({
      messages: prompt,
      systemMessage: moderatorDescription,
      functions: chatFunctions,
      function_call: {
        name: ChatFunctions.selectAgent,
      },
    });

    const agentSelection = response.choices[0].message?.function_call?.arguments;
    const args = JSON.parse(agentSelection ?? "{}");
    if (!args.agentId) throw new Error("No agent selected");

    const agentSpecs = await AgentControllerService.getInstance().getAgent(args.agentId);
    return createAgent(agentSpecs, this.completionService);
  }

  /** Single agent completion request, in this mode the selected agent in XXX will
   * be the one responding
   * *  Respond based on the following conditions:
   *  1. The previous {@link MAX_CONSECUTIVE_ASSISTANT_MESSAGES } messages where not
   *     sent exclusively by the assistant.
   *  2. An agent cannot respond consecutively. */
  public async requestCompletion() {
    try {
      if (this.isLoading) throw new Error("Another completion is already in progress.");
      const messages = this.getMessages();

      // -----------------------------------------------------------------------
      const isConsecutive = messages.slice(-MAX_CONSECUTIVE_ASSISTANT_MESSAGES).every((message) => message.role === ChatMessageRole.Assistant);
      if (isConsecutive) return;

      const agent = await this.selectAgent(messages);
      await agent.initialize();
      const agentSpecs = agent.getSpecs();

      const lastMessage = messages[messages.length - 1];
      const alreadyResponded = lastMessage.role === ChatMessageRole.Assistant && lastMessage.agent.id === agentSpecs.id;
      if (alreadyResponded) return;

      // -----------------------------------------------------------------------
      /*create the message*/
      const message = createAgentMessage("", agentSpecs);
      this.isLoading = true;
      let messageAdded = false; /*add the message only when we have an actual response*/
      await agent.getResponse(messages, (content) => {
        if (!messageAdded) {
          this.addMessage({ ...message, content });
          messageAdded = true;
          return;
        }
        this.updateMessage({ ...message, content });
      });
      this.isLoading = false;

      // Request another completion
      this.requestCompletion();
    } catch (e) {
      this.logger.error(e); /*log the error*/
      throw e;
    }
  }
}
