import { Card } from "@chakra-ui/react";
import { ChatInput } from "./chat-input";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";

type Props = {};

export const Chat = (props: Props) => {
  return (
    <Card
      width="100vw"
      height="100vh"
      backgroundColor="gray.800"
      borderRadius={0}
      boxShadow="none"
    >
      <ChatHeader />
      <ChatMessages />
      <ChatInput />
    </Card>
  );
};
