import React from "react";
import { ChatMessage, DefaultAgent } from "../type";
import { Card, CardBody, CardHeader, Stack, Text } from "@chakra-ui/react";
import { Input } from "./Input";
import { Message } from "./Message";
import { getChatCompletion } from "../api";
import { nanoid } from "nanoid";

export const Chat = () => {
  // State for the messages
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  // Adds a message to the conversation's history
  const pushMessage = async (message: ChatMessage) => {
    const messageHistory = [...messages, message];

    setMessages(messageHistory);
    // Call API to send message to the agent
    const response = await getChatCompletion(messageHistory);
    // Pushes the agent's response to the state
    setMessages([
      ...messageHistory,
      {
        id: nanoid(),
        agent: DefaultAgent,
        content: response?.content ?? "",
      },
    ]);
  };

  return (
    <Card
      width="100vw"
      height="100vh"
      backgroundColor="gray.800"
      borderRadius={0}
      boxShadow="none"
    >
      <CardHeader>
        <Text fontSize="2xl" fontWeight="bold" color="white">
          Chat
        </Text>
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
