import { CardBody, Stack } from "@chakra-ui/react";
import { ChatMessage } from "./type";
import { AgentMessage } from "./agent-message";
import { UserMessage } from "./user-message";

type Props = {
  messages: ChatMessage[];
};

export const ChatMessages = ({ messages = [] }: Props) => {
  return (
    <CardBody overflow="auto">
      <Stack spacing={3}>
        {messages.map((message) => {
          // If the message has an agent, render the agent message
          // Otherwise, render the user message
          return message.agent ? (
            <AgentMessage
              key={message.id}
              message={message.message}
              agentName={message.agent.name}
              agentColor={message.agent.color}
            />
          ) : (
            <UserMessage key={message.id} message={message.message} />
          );
        })}
      </Stack>
    </CardBody>
  );
};
