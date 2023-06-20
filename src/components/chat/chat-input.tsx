import { ChatIcon } from "@chakra-ui/icons";
import { Button, CardFooter, Flex, Input } from "@chakra-ui/react";
import React from "react";

type Props = {};

export const ChatInput = (props: Props) => {
  return (
    <CardFooter p="0">
      <Flex gap="1em" padding="6" boxShadow="lg" bg="gray.600" width="100%">
        <Input placeholder="Type here..." backgroundColor="white" />
        <Button rightIcon={<ChatIcon />} colorScheme="teal">
          Send
        </Button>
      </Flex>
    </CardFooter>
  );
};
