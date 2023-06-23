import { useEffect, useRef, useState } from "react";
import { Card, CardBody, CardHeader, Stack, Text } from "@chakra-ui/react";

import { chatServiceInstance } from "../service";

import { AgentSelect } from "./AgentSelect";
import { ChatMessage } from "../type";
import { Input } from "./Input";
import { Message } from "./Message";

export const Chat = () => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // === State ====================================================================
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // === Effect ===================================================================
  /** subscribe to the message added event */
  useEffect(() => {
    const unsubscribe = chatServiceInstance.onMessages(messages => setMessages(messages))
    // unsubscribe when the component is unmounted
    return () => unsubscribe();
  }, []);

  /** scrolls to the bottom of the chat when a new message is added */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // === UI =======================================================================
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
          <div ref={bottomRef} />
        </Stack>
      </CardBody>
      <Input />
    </Card>
  );
};
