import { ChatMessage } from "@/chat/type";
import { AgentMessage } from "./AgentMessage";
import { UserMessage } from "./UserMessage";

type Props = {
  message: ChatMessage;
};

export const Message: React.FC<Props> = ({ message }) => {
  return (
    <>
      {
        // If the message has an agent, render the agent message
        // Otherwise, render the user message
        message.agent ? (
          <AgentMessage
            key={message.id}
            message={message.content}
            agentName={message.agent.name}
            agentColor={message.agent.color}
          />
        ) : (
          <UserMessage key={message.id} message={message.content} />
        )
      }
    </>
  );
};
