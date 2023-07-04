import { AgentMessage } from "./AgentMessage";
import { ChatMessage, ChatMessageRole } from "@/chat/type";
import { UserMessage } from "./UserMessage";

// ********************************************************************************
type Props = {
  message: ChatMessage;
};

export const Message: React.FC<Props> = ({ message }) => {
  if (message.role === ChatMessageRole.Assistant) {
    return <AgentMessage {...message} />;
  }

  if (message.role === "user") {
    return <UserMessage {...message} />;
  }

  return null;
};
