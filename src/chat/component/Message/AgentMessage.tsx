import { Avatar, Box, Flex, Stack, Text, useDisclosure } from "@chakra-ui/react";

import { SingleAgentChat } from "@/chat/service";

import { AssistantChatMessage } from "@/chat/type";
import { getContrastColor } from "@/utils/colors";

import { DeleteButton, EditButton } from "../Button";
import { EditModal } from "./EditModal";

// ********************************************************************************
export const AgentMessage: React.FC<AssistantChatMessage> = (message) => {
  const color = message.agent.color;
  const contrastColor = getContrastColor(message.agent.color);

  // == Hook ======================================================================
  const { isOpen, onClose, onOpen } = useDisclosure();

  // == Handler ===================================================================
  const handleDelete = () => SingleAgentChat.getInstance().removeMessage(message.id);
  const handleEdit = () => onOpen();

  return (
    <Flex width="100%" role="group" px="6" py="2" gap="0.5em" minH="75px" align="center">
      <Flex gap="1em" maxWidth="90%">
        <Avatar
          name={message.agent.name}
          backgroundColor={color}
          color={contrastColor}
        />
        <Box flex={1} backgroundColor="#40414f" color="white" padding="4" boxShadow="lg" borderRadius="lg" pt="2">
          <Text whiteSpace="pre-line" fontWeight="bold" >{message.agent.name}</Text>
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
