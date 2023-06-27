import { Avatar, Box, Flex, Stack, Text, useDisclosure } from "@chakra-ui/react";

import { chatServiceInstance } from "@/chat/service";

import { AssistantChatMessage } from "@/chat/type";
import { getContrastColor } from "@/utils/colors";

import { DeleteButton, EditButton } from "../Button";
import { EditModal } from "./EditModal";

// ********************************************************************************
export const AgentMessage: React.FC<AssistantChatMessage> = (message) => {
  const color = message.isAgent ? message.agent.color : "teal";
  const contrastColor = message.isAgent ? getContrastColor(message.agent.color) : "white";

  // == Hook ======================================================================
  const { isOpen, onClose, onOpen } = useDisclosure();

  // == Handler ===================================================================
  const handleDelete = () => chatServiceInstance.removeMessage(message.id);
  const handleEdit = () => onOpen();

  return (
    <Box maxWidth="90%">
      <Flex gap="1em" px="6" py="2">
        <Avatar
          name={message.isAgent ? message.agent.name : "Chatbot"}
          backgroundColor={color}
          color={contrastColor}
        />
        <Stack>
          <Box
            backgroundColor={color}
            color={contrastColor}
            padding="4"
            boxShadow="lg"
            borderRadius="lg"
          >
            <Text>{message.content}</Text>
          </Box>
          <Flex width="100%" gap="0.5em" justify="flex-start">
            <EditButton onClick={handleEdit} />
            <DeleteButton onClick={handleDelete} />
          </Flex>
        </Stack>
      </Flex>
      <EditModal message={message} isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};
