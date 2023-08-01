import { useEffect, useRef, useState } from "react";
import { Card, CardBody, Center, Flex, Stack, Text } from "@chakra-ui/react";

import { SingleAgentChat } from "../service";

import { ChatMessage } from "../type";
import { AgentSelect } from "../../agent/component/AgentSelect";
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
    const subscription = SingleAgentChat.getInstance().onMessage$().subscribe((newMessages) => {
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
    <Flex as="main" flex="1" height="100vh" justify="center" align="flex-end" bg="#343541" overflow="auto" position="relative">
      <Center width="100%" position="fixed" top="0" zIndex="1" bg="#343541" height="80px" p="1em" gap="1em">
        <Flex flex="1" justify="center" gap="1em">
          <Text textAlign="center" fontSize="2xl" fontWeight="bold" color="white">
            Multi-Agent Chat
          </Text>
          <AgentSelect />
        </Flex>
      </Center>
      <Card width="80%" height="100%" bg="#343541" boxShadow="none" pt="80px">
        <CardBody maxW="800px" mx="auto" width="100%">
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
