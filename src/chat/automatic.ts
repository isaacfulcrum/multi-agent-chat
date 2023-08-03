import { AgentIdentifier } from "@/agent/type";
import { AbstractChatService, ChatMessage } from "./type";
import { AgentControllerService } from "@/agentController/service";
import { ChatFunctions, chatFunctions, getModeratorPrompt } from "./function";
import { OpenAIService } from "@/openai/service";
import { ConversationalAgentOpenAI } from "@/agent/service";
import { chatMessagesToCompletionMessages, createAgentMessage } from "./util";

/**
 * TODO: This is a temporary file for the automatic agent chat
 * We should think how to integrate this with different chat services*/

/** A chat service that evaluates the user's messages and selects the best agent
 * to respond to the user*/
// ********************************************************************************
export class AutomaticAgentChat extends AbstractChatService {
  // == Singleton =================================================================
  private static singleton: AutomaticAgentChat;
  public static getInstance() {
    if (!AutomaticAgentChat.singleton) AutomaticAgentChat.singleton = new AutomaticAgentChat();
    return AutomaticAgentChat.singleton;
  }

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
   * be the one responding*/
  public requestCompletion = async () => {
    try {
      const agentId = await this.selectAgent(this.getMessages());

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
  };
}
