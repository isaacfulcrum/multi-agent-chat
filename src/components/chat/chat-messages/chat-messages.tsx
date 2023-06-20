import { CardBody, Stack } from "@chakra-ui/react";
import { MessageSkeleton } from "./message-skeleton";
import { Agent, ChatMessage } from "./type";
import { AgentMessage } from "./agent-message";
import { UserMessage } from "./user-message";

const testAgent: Agent = {
  id: "1",
  name: "Agent",
  color: "#3182CE",
  description: "This is a test agent",
};

// Messages to display in the chat
const messages: ChatMessage[] = [
  {
    id: "1",
    message: "Hello",
  },
  {
    id: "2",
    message: "Hi",
    agent: testAgent,
  },
  {
    id: "3",
    message: "How are you?",
  },
];

export const ChatMessages = () => {
  return (
    <CardBody>
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
