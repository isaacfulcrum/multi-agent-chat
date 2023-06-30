import { useEffect, useRef, useState } from "react";
import { Card, CardBody, CardHeader, Center, Flex, Stack, Text } from "@chakra-ui/react";

import { chatServiceInstance } from "../service";

import { ChatMessage } from "../type";
import { Input } from "./Input";
import { Message } from "./Message";
import { AgentButton } from "@/agent/component/AgentButton";

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
    <Flex width="100vw" height="100vh" justify="center" align="flex-end" bg="#343541" overflow="auto" position="relative">
      <Center width="100%" position="fixed" top="0" zIndex="1" bg="#343541" height="80px" p="1em" gap="1em">
        <Text textAlign="center" fontSize="2xl" fontWeight="bold" color="white" >
          Multi-Agent Chat
        </Text>
        <AgentButton />
      </Center>
      <Card width="80%" maxW="800px" height="100%" bg="#343541" boxShadow="none" pt="80px">
        <CardBody>
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
