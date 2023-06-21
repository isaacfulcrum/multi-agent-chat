import { AgentType } from "@/agent/type";
import { ChatCompletionRequestMessageRoleEnum } from "openai";

export type ChatMessage = {
  id: string;
  // One of the roles defined in chatRoles
  content: string;
  // In case an agent sends the message,
  // this property will include the agent's information
  agent?: AgentType;
  role?: ChatCompletionRequestMessageRoleEnum;
};
