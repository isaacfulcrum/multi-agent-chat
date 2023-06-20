import { CardBody, Stack } from "@chakra-ui/react";
import { MessageSkeleton } from "./message-skeleton";

type Props = {};

// Messages to display in the chat
const messages = [
  {
    id: 1,
    message: "Hello",
  },
  {
    id: 2,
    message: "Hi",
  },
  {
    id: 3,
    message: "How are you?",
  },
];

export const ChatMessages = (props: Props) => {
  return (
    <CardBody>
      <Stack spacing={3}>
        {messages.map((message) => (
          <MessageSkeleton key={message.id} />
        ))}
      </Stack>
    </CardBody>
  );
};
