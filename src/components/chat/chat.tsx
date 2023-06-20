import React from "react";
import { Card } from "@chakra-ui/react";
import { ChatInput } from "./chat-input/chat-input";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatMessage } from "./chat-messages/type";

type Props = {};

export const Chat = (props: Props) => {
  // State for the messages
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  // Function to push messages to the state
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
      <ChatHeader />
      <ChatMessages messages={messages} />
      <ChatInput pushMessage={pushMessage} />
    </Card>
  );
};
