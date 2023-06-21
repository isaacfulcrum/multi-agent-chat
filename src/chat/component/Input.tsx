import React from "react";
import { ChatMessage } from "../type";
import { ChatIcon } from "@chakra-ui/icons";
import {
  Button,
  CardFooter,
  Flex,
  Input as ChakraInput,
} from "@chakra-ui/react";
import { nanoid } from "nanoid";
import { ChatCompletionRequestMessageRoleEnum } from "openai";

type Props = {
  pushMessage: (message: ChatMessage) => void;
  isLoading: boolean;
};

export const Input: React.FC<Props> = ({ pushMessage, isLoading }) => {
  const [message, setMessage] = React.useState("");

  const onSubmit = () => {
    // Prevents the user from sending a message while the AI is typing
    if (isLoading) return;
    // Creates a unique id for the message
    const id = nanoid();
    // Pushes the message to the state
    pushMessage({
      id,
      content: message,
      role: ChatCompletionRequestMessageRoleEnum.User,
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
          <ChakraInput
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type here..."
            backgroundColor="white"
            autoFocus
          />
          <Button
            rightIcon={<ChatIcon />}
            colorScheme="teal"
            type="submit"
            isDisabled={!message || isLoading}
          >
            Send
          </Button>
        </Flex>
      </form>
    </CardFooter>
  );
};
