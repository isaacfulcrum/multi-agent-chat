import { Button, CardFooter,Flex, Input as ChakraInput } from "@chakra-ui/react";
import { ChangeEventHandler, FormEventHandler, useState } from "react";
import { ChatIcon } from "@chakra-ui/icons";
import { nanoid } from "nanoid";

import { chatServiceInstance } from "../service";

import { ChatMessageRoleEnum } from "../type";

// ********************************************************************************
export const Input = () => {
  // === State ====================================================================
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // === Handler ==================================================================
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setMessage(e.target.value);
  };

  const handlerSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if(isLoading) return; 

    setMessage("");
    setIsLoading(true);

    try {
      chatServiceInstance.addMessage({ id: nanoid(), content: message, role: ChatMessageRoleEnum.User });
      await chatServiceInstance.requestCompletion();
    } catch (error){
      // TODO: Handle error
      console.log(error);
    }

    setIsLoading(false);
  };

  return (
    <CardFooter p="0">
      <form onSubmit={handlerSubmit} style={{ flex: 1 }} >
        <Flex gap="1em" padding="6" backgroundColor="#343541" width="100%">
          <ChakraInput
            value={message}
            onChange={handleInputChange}
            placeholder="Type here..."
            backgroundColor="#40414f"
            color="white"
            autoFocus
          />
          <Button
            rightIcon={<ChatIcon />}
            colorScheme="teal"
            type="submit"
            isDisabled={!message || chatServiceInstance.isLoading}
          >
            Send
          </Button>
        </Flex>
      </form>
    </CardFooter>
  );
};
