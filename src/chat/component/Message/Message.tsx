import { ChatMessage, ChatMessageRoleEnum } from "@/chat/type";
import { AgentMessage } from "./AgentMessage";
import { UserMessage } from "./UserMessage";

type Props = {
  message: ChatMessage;
};

export const Message: React.FC<Props> = ({ message }) => {
  if (message.role === ChatMessageRoleEnum.Assistant) {
    return <AgentMessage {...message} />;
  }

  if (message.role === "user") {
    return <UserMessage {...message} />;
  }

  return null;
};
