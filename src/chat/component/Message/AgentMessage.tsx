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
    <Box maxWidth="90%" role="group">
      <Flex gap="1em" px="6" py="2">
        <Avatar
          name={message.isAgent ? message.agent.name : "Chatbot"}
          backgroundColor={color}
          color={contrastColor}
        />
        <Stack>
          <Box backgroundColor={color} color={contrastColor} padding="4" boxShadow="lg" borderRadius="lg">
            <Text whiteSpace="pre-line">{message.content}</Text>
          </Box>
          <Flex width="100%" justify="flex-end" minH="1.5em">
            <Flex gap="0.5em" display="none" _groupHover={{ display: "flex" }}>
              <EditButton onClick={handleEdit} />
              <DeleteButton onClick={handleDelete} />
            </Flex>
          </Flex>
        </Stack>
      </Flex>
      <EditModal message={message} isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};
