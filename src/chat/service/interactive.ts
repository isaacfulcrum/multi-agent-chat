import { AgentIdentifier, AgentType } from "@/agent/type";
import { ConceptualAgent, ConversationalAgent } from "@/agent/service";
import { AgentControllerService } from "@/agentController/service";
import { OpenAIService } from "@/openai/service";

import { AbstractChatService, ChatMessage, ChatMessageRole, ChatMode } from "../type";
import { ChatFunctions, chatFunctions, getModeratorPrompt, moderatorDescription } from "../function";
import { createAgentMessage } from "../util";

// ********************************************************************************
const MAX_CONSECUTIVE_ASSISTANT_MESSAGES = 5;

/** A chat service that evaluates the user's messages and selects the best agent
 * to respond to the user*/
export class InteractiveAgentChat extends AbstractChatService {
  protected chatMode = ChatMode.Interactive; /*chat mode*/
  // == Lifecycle =================================================================
  public constructor() {
    super();
  }

  // == Completion ================================================================
  /** Semantically chooses an Agent based on a history of messages and the Agent's
   *  description */
  public async selectAgent(messages: ChatMessage[]): Promise<AgentIdentifier | null /*not found*/> {
    try {
      const agentList = await AgentControllerService.getInstance().getAgents();
      /**
       * TODO: This prompt will be handled by a tool similar to an Agent,
       * that way this function won't interact directly with the OpenAI API */
      const prompt = getModeratorPrompt(messages, agentList);

      const response = await OpenAIService.getInstance().chatCompletion({
        messages: prompt,
        systemMessage: moderatorDescription,
        functions: chatFunctions,
        function_call: {
          name: ChatFunctions.selectAgent,
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

      // create the agent
      const selectedAgentSpecs = await AgentControllerService.getInstance().getAgent(agentId);
      let agent: ConversationalAgent;

      if (selectedAgentSpecs.type === AgentType.Conceptual) {
        agent = new ConceptualAgent(selectedAgentSpecs.id, OpenAIService.getInstance());
      } else {
        agent = new ConversationalAgent(selectedAgentSpecs.id, OpenAIService.getInstance()); /*default*/
      }
      await agent.initialize();
      const agentSpecs = agent.getSpecs(); // TODO: This is redundant, we already have the agent specs in the variable 'selectedAgentSpecs'
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
    } catch (error) {
      console.error(error);
      // Handle error
    }
  }
}
