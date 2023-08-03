import { AgentIdentifier } from "@/agent/type";
import { AgentControllerService } from "@/agentController/service";
import { OpenAIService } from "@/openai/service";
import { ConversationalAgentOpenAI } from "@/agent/service";

import { AbstractChatService, ChatMessage, ChatMessageRole } from "./type";
import { chatMessagesToCompletionMessages, createAgentMessage } from "./util";
import { ChatFunctions, chatFunctions, getModeratorPrompt } from "./function";

const MAX_CONSECUTIVE_ASSISTANT_MESSAGES = 5;

/**
 * TODO: This is a temporary file for the automatic agent chat
 * We should think how to integrate this with different chat services*/

/** A chat service that evaluates the user's messages and selects the best agent
 * to respond to the user*/
// ********************************************************************************
export class AutomaticAgentChat extends AbstractChatService {
  // == Lifecycle =================================================================
  protected constructor() {
    super();
  }

  // == Completion ================================================================
  /** Semantically chooses an Agent based on a history of messages and the Agent's
   *  description */
  public async selectAgent(messages: ChatMessage[]): Promise<AgentIdentifier | null /*not found*/> {
    try {
      const agentList = await AgentControllerService.getInstance().getAgents();
      // Message with the description of the agents
      const prompt = getModeratorPrompt(messages, agentList);

      const response = await OpenAIService.getInstance().chatCompletion({
        messages: prompt,
        functions: chatFunctions,
        function_call: {
          name: ChatFunctions.selectAgent /** forces it to select an agent */,
        },
      });
      if (!response) throw new Error("No response from OpenAI API");
      // Return the arguments of the function call

      const agentSelection = response.choices[0].message?.function_call?.arguments;

      if (!agentSelection) return null;

      const args = JSON.parse(agentSelection ?? "{}");
      if (!args.agentId) return null;

      return args.agentId;
    } catch (error) {
      // Type assertion: Treat the error as 'any'
      const errorWithResponse = error as any;

      // Check if the error object has a property called 'response'
      if (errorWithResponse.response) {
        const errorMessage = errorWithResponse.response?.data?.error?.message;
        throw new Error(`OpenAI API returned an error: ${errorMessage}`);
      }
      // If it doesn't have a 'response' property, re-throw the original error
      throw error;
    }
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

      const agentId = await this.selectAgent(messages);
      if (!agentId) throw new Error("No agent selected");

      const lastMessage = messages[messages.length - 1];
      const alreadyResponded = lastMessage.role === ChatMessageRole.Assistant && lastMessage.agent.id === agentId;
      if (alreadyResponded) return;

      const agent = new ConversationalAgentOpenAI(agentId);
      const AgentProfile = await agent.getProfile();
      if (!AgentProfile) throw new Error(`Agent ${agent} not found`); // TODO: maybe this should be handled by getProfile()

      // -----------------------------------------------------------------------
      /*create the message*/
      const message = createAgentMessage("", AgentProfile);
      this.isLoading = true;
      let messageAdded = false; /*add the message only when we have an actual response*/
      await agent.getResponse(chatMessagesToCompletionMessages(messages), (content) => {
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
    } catch (error) {
      console.error(error);
      // Handle error
    }
  }
}
