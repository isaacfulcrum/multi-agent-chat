import React from "react";
import { ChatMessage } from "../type";
import { Card, CardBody, CardHeader, Stack, Text } from "@chakra-ui/react";
import { Input } from "./Input";
import { Message } from "./Message";

export const Chat = () => {
  // State for the messages
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  // Adds a message to the conversation's history
  const pushMessage = (message: ChatMessage) => {
    setMessages((messages) => [...messages, message]);
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
