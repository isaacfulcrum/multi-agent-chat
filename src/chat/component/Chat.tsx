import { useEffect, useRef, useState } from "react";
import { Card, CardBody, CardHeader, Flex, Stack, Text } from "@chakra-ui/react";

import { chatServiceInstance } from "../service";

import { AgentSelect } from "./AgentSelect";
import { ChatMessage } from "../type";
import { Input } from "./Input";
import { Message } from "./Message";

// ********************************************************************************
export const Chat = () => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // === State ====================================================================
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // === Effect ===================================================================
  /** subscribe to the messages updates */
  useEffect(() => {
    const subscription = chatServiceInstance.onMessage$().subscribe((newMessages) => {
      setMessages(newMessages);
    });
    // unsubscribe when the component is unmounted
    return () => subscription.unsubscribe();
  }, []);

  /** scrolls to the bottom of the chat when a new message is added */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // === UI =======================================================================
  return (
    <Flex width="100vw" height="100vh" justify="center" align="flex-end" backgroundColor="gray.900">
      <Card width="100%" maxW="800px" height="100%" backgroundColor="gray.800">
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
    </Flex>
  );
};
