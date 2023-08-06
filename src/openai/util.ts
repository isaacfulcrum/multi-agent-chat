import { ChatCompletionRequestMessage } from "openai";
import { ChatMessage, ChatMessageRole } from "@/chat/type";

// ********************************************************************************

/** Converts a chat message to a completion message (for OpenAI) */
const chatMessageToCompletionMessage = (message: ChatMessage): ChatCompletionRequestMessage => {
  let name = "chat_user";
  if (message.role === ChatMessageRole.Function) {
    name = message.name;
  }
  if (message.role === ChatMessageRole.Assistant) {
    name = message.agent.id;
  }
  return {
    role: message.role,
    content: message.content,
    name,
  };
};

/** Converts a list of chat messages to a list of completion messages (for OpenAI) */
export const chatMessagesToCompletionMessages = (messages: ChatMessage[]): ChatCompletionRequestMessage[] => {
  return messages.map(chatMessageToCompletionMessage);
};
