import { CardFooter, Flex, IconButton, Input as ChakraInput, Tooltip } from "@chakra-ui/react";
import { ChangeEventHandler, FormEventHandler, KeyboardEvent, useState } from "react";
import { ChatIcon } from "@chakra-ui/icons";
import { nanoid } from "nanoid";

import { chatServiceInstance } from "../service";

import { ChatMessageRole, UserChatMessage } from "../type";
import { agentServiceInstance } from "@/agent/service";

// ********************************************************************************
export const Input = () => {
  // === State ====================================================================
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // === Function =================================================================
  const sendMessage = async (message: string) => {
    try {
      if (message.trim() !== "") {
        const newMessage: UserChatMessage = {
          id: nanoid(),
          role: ChatMessageRole.User,
          content: message,
        };
        await chatServiceInstance.addMessage(newMessage);
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
      const messageHistory = chatServiceInstance.getCompletionMessages();
      const agent = agentServiceInstance.getSelectedAgent();
      /* run the completion directly */
      await chatServiceInstance.runCompletion(messageHistory, agent);
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
      await chatServiceInstance.requestCompletion();
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
