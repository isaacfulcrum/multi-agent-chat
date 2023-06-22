import { useEffect, useState } from "react";
import { ChatMessage } from "../type";
import { Card, CardBody, CardHeader, Stack, Text } from "@chakra-ui/react";
import { Input } from "./Input";
import { Message } from "./Message";
import ChatServiceInstance from "../service";
import { AgentSelect } from "./AgentSelect";

export const Chat = () => {
  // === State ====================================================================
  const [messages, setMessages] = useState<ChatMessage[]>(ChatServiceInstance.messages);

  // === Effect ===================================================================
  useEffect(() => {
    // Update UI callback triggered when a message is added -----------------------
    const updateMessages = () => setMessages([...ChatServiceInstance.messages]);
    const handleMessageAdded = () => updateMessages();
    // Subscribe to the message added event
    ChatServiceInstance.onMessageAdded = handleMessageAdded;
    // Unsubscribe from the message added event when the component unmounts
    return () => {
      ChatServiceInstance.onMessageAdded = undefined;
    };
  }, []);

  return (
    <Card width="100vw" height="100vh" backgroundColor="gray.800" borderRadius={0} boxShadow="none">
      <CardHeader>
        <Stack direction="row" spacing={3} justify="center">
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Chatting with:
          </Text>
          <AgentSelect />
        </Stack>
      </CardHeader>
      <CardBody overflow="auto">
        <Stack spacing={3}>
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          {/* <div ref={bottomRef} /> */}
        </Stack>
      </CardBody>
      <Input />
    </Card>
  );
};
