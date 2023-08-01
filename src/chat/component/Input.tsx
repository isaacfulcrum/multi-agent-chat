import { CardFooter, Flex, IconButton, Input as ChakraInput, Tooltip } from "@chakra-ui/react";
import { ChangeEventHandler, FormEventHandler, KeyboardEvent, useState } from "react";
import { ChatIcon } from "@chakra-ui/icons";

import { useIsMounted } from "@/shared/hook/useIsMounted";

import { createUserMessage } from "../util";
import { SingleAgentChat } from "../service";



// ********************************************************************************
export const Input = () => {
  const isMounted = useIsMounted()
  // === State ====================================================================
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // === Function =================================================================
  const sendMessage = async (message: string) => {
    try {
      if (message.trim() !== "") {
        const newMessage = createUserMessage(message);
        // TODO: Check if a completion is runnning
        await SingleAgentChat.getInstance().addMessage(newMessage);
        if (!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // === Handler ==================================================================
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setMessage(e.target.value);
  };

  const singleMessageHandler: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    try {
      setIsLoading(true);
      sendMessage(message);
      /* run the completion directly */
      await SingleAgentChat.getInstance().requestCompletion();
    } catch (error) {
      // TODO: Handle error
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const automaticMessageHandler = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      sendMessage(message);
      await SingleAgentChat.getInstance().requestCompletion();
    } catch (error) {
      // TODO: Handle error
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && event.metaKey) {
      automaticMessageHandler();
    }
  };

  return (
    <CardFooter p="0">
      <form onSubmit={singleMessageHandler} style={{ flex: 1 }}>
        <Flex gap="1em" padding="6" backgroundColor="#343541" width="100%" mx="auto" maxW="1000px">
          <ChakraInput
            value={message}
            placeholder="Type here..."
            onKeyDown={onKeyDownHandler}
            onChange={handleInputChange}
            backgroundColor="#40414f" color="white" autoFocus
          />
          <Tooltip label="Single message" fontSize="md">
            <IconButton aria-label="Single message" colorScheme="teal" icon={<ChatIcon />} type="submit" isLoading={isLoading} />
          </Tooltip>
          <Tooltip label="Automatic" fontSize="md">
            <IconButton aria-label="Automatic" colorScheme="teal" icon={<>🚀</>} onClick={automaticMessageHandler} isLoading={isLoading} />
          </Tooltip>
        </Flex>
      </form>
    </CardFooter>
  );
};
