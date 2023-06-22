import React from "react";
import { ChatMessage, ChatMessageRoleEnum } from "../type";
import { ChatIcon } from "@chakra-ui/icons";
import {
  Button,
  CardFooter,
  Flex,
  Input as ChakraInput,
} from "@chakra-ui/react";
import { nanoid } from "nanoid";
import ChatServiceInstance from "../service";

export const Input = () => {
  // === State ====================================================================
  const [message, setMessage] = React.useState("");

  // === Handler ==================================================================
  const addMessage = (message: ChatMessage) => ChatServiceInstance.addMessage(message);

  const onSubmit = () => {
    // Prevents the user from sending a message while the AI is typing
    // TODO: if (ChatServiceInstance.isTyping) 
    const id = nanoid();
    addMessage({
      id,
      content: message,
      role: ChatMessageRoleEnum.User,
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
            isDisabled={!message}
          >
            Send
          </Button>
        </Flex>
      </form>
    </CardFooter>
  );
};
