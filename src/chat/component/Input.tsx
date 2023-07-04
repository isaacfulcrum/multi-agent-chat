import { CardFooter, Flex, IconButton, Input as ChakraInput, Tooltip } from "@chakra-ui/react";
import { ChangeEventHandler, FormEventHandler, useState } from "react";
import { ChatIcon, StarIcon } from "@chakra-ui/icons";
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

  const singleMessageHandler = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      sendMessage(message);
      const messageHistory = chatServiceInstance.getCompletionMessages();
      // Runs completion on the selected agent
      const agent = agentServiceInstance.getSelectedAgent();
      await chatServiceInstance.runCompletion(messageHistory, agent);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const automaticMessageHandler: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);
      sendMessage(message);
      await chatServiceInstance.requestCompletion();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardFooter p="0">
      <form onSubmit={automaticMessageHandler} style={{ flex: 1 }}>
        <Flex gap="1em" padding="6" backgroundColor="#343541" width="100%" mx="auto" maxW="1000px">
          <ChakraInput value={message} onChange={handleInputChange} placeholder="Type here..." backgroundColor="#40414f" color="white" autoFocus />
          <Tooltip label="Single message" fontSize="md">
            <IconButton aria-label="Single message" colorScheme="teal" icon={<StarIcon />} onClick={singleMessageHandler} isLoading={isLoading} />
          </Tooltip>
          <Tooltip label="Automatic" fontSize="md">
            <IconButton aria-label="Automatic" colorScheme="teal" icon={<ChatIcon />} type="submit" isLoading={isLoading} />
          </Tooltip>
        </Flex>
      </form>
    </CardFooter>
  );
};
