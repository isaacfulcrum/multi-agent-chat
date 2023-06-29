import { Avatar, Box, Flex, Stack, Text, useDisclosure } from "@chakra-ui/react";

import { chatServiceInstance } from "@/chat/service";

import { AssistantChatMessage } from "@/chat/type";
import { getContrastColor } from "@/utils/colors";

import { DeleteButton, EditButton } from "../Button";
import { EditModal } from "./EditModal";

// ********************************************************************************
export const AgentMessage: React.FC<AssistantChatMessage> = (message) => {
  const color = message.isAgent ? message.agent.color : "skyblue";
  const contrastColor = message.isAgent ? getContrastColor(message.agent.color) : "black";

  // == Hook ======================================================================
  const { isOpen, onClose, onOpen } = useDisclosure();

  // == Handler ===================================================================
  const handleDelete = () => chatServiceInstance.removeMessage(message.id);
  const handleEdit = () => onOpen();

  return (
    <Flex width="100%" role="group" px="6" py="2" gap="0.5em">
      <Flex gap="1em"  maxWidth="90%">
        <Avatar
          name={message.isAgent ? message.agent.name : "Chatbot"}
          backgroundColor={color}
          color={contrastColor}
        />
        <Box flex={1} backgroundColor={color} color={contrastColor} padding="4" boxShadow="lg" borderRadius="lg" pt="2">
          <Text whiteSpace="pre-line" fontWeight="bold" >{message.isAgent ? message.agent.name : ''}</Text>
          <Text whiteSpace="pre-line">{message.content}</Text>
        </Box>
      </Flex>
      <Stack gap="0.5em" display="none" _groupHover={{ display: "flex" }}>
        <EditButton onClick={handleEdit} />
        <DeleteButton onClick={handleDelete} />
      </Stack>
      <EditModal message={message} isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
};
