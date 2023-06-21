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
  const { loadingResponse } = useAgent({
    selectedAgent,
    messages,
    pushMessage,
  });

  // Scroll to last function
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const scrollToLastElement = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  React.useEffect(() => {
    scrollToLastElement();
  }, [messages]);

  return (
    <Card
      width="100vw"
      height="100vh"
      backgroundColor="gray.800"
      borderRadius={0}
      boxShadow="none"
    >
      <CardHeader>
        <Stack direction="row" spacing={3} justify="center">
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Chatting with:
          </Text>
          <Select
            isDisabled={loadingResponse}
            placeholder="Default Agent"
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            backgroundColor="white"
            maxWidth="300px"
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
      <CardBody overflow="auto" ref={bottomRef}>
        <Stack spacing={3}>
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          <div ref={bottomRef} />
        </Stack>
      </CardBody>
      <Input pushMessage={pushMessage} isLoading={loadingResponse} />
    </Card>
  );
};
