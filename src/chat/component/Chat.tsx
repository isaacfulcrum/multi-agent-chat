import React from "react";
import { ChatMessage } from "../type";
import {
  Card,
  CardBody,
  CardHeader,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Input } from "./Input";
import { Message } from "./Message";
import { useAgent } from "@/agent/hook/useAgent";
import { agentList, defaultAgent } from "@/agent/type";

export const Chat = () => {
  // State for the messages
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  // State for the selected agent
  const [selectedAgentId, setSelectedAgentId] = React.useState<string>("");
  const selectedAgent =
    agentList.find((agent) => agent.id === selectedAgentId) || defaultAgent;

  // Adds a message to the conversation's history
  const pushMessage = React.useCallback(
    async (message: ChatMessage) => {
      const messageHistory = [...messages, message];
      setMessages(messageHistory);
    },
    [messages]
  );
  // Observes the messages as they change and responds to them
  useAgent({ selectedAgent, messages, pushMessage });

  return (
    <Card
      width="100vw"
      height="100vh"
      backgroundColor="gray.800"
      borderRadius={0}
      boxShadow="none"
    >
      <CardHeader>
        <Stack direction="row" spacing={3}>
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Chat
          </Text>
          <Select
            placeholder="Select agent"
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            backgroundColor="white"
          >
            {
              // Agent list options
              agentList.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))
            }
          </Select>
        </Stack>
      </CardHeader>
      <CardBody overflow="auto">
        <Stack spacing={3}>
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </Stack>
      </CardBody>
      <Input pushMessage={pushMessage} />
    </Card>
  );
};
