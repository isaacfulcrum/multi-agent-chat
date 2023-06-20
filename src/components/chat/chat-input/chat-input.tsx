import React from "react";
import { ChatIcon } from "@chakra-ui/icons";
import { Button, CardFooter, Flex, Input } from "@chakra-ui/react";
import { ChatMessage } from "../chat-messages/type";
import { nanoid } from "nanoid";

type Props = {
  pushMessage: (message: ChatMessage) => void;
};

export const ChatInput = ({ pushMessage }: Props) => {
  const [message, setMessage] = React.useState("");

  const onSubmit = () => {
    // Creates a unique id for the message
    const id = nanoid();
    // Pushes the message to the state
    pushMessage({
      id,
      message,
    });
    // Resets the input
    setMessage("");
  };

  return (
    <CardFooter p="0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        style={{ flex: 1 }}
      >
        <Flex gap="1em" padding="6" boxShadow="lg" bg="gray.600" width="100%">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type here..."
            backgroundColor="white"
          />
          <Button
            rightIcon={<ChatIcon />}
            colorScheme="teal"
            type="submit"
            isDisabled={!message}
          >
            Send
          </Button>
        </Flex>
      </form>
    </CardFooter>
  );
};
