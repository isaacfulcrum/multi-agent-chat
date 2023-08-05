import { Avatar, Box, Flex, Stack, Text, useDisclosure } from "@chakra-ui/react";

import { AssistantChatMessage } from "@/chat/type";
import { getContrastColor } from "@/util/colors";
import { useChat } from "@/chat/hook/useChat";
import { isConversationalAgentSpecs } from "@/agent/type";

import { DeleteButton, EditButton } from "../Button";
import { EditModal } from "./EditModal";

// ********************************************************************************
export const AgentMessage: React.FC<AssistantChatMessage> = (message) => {
  // == Constants =================================================================
  const color = isConversationalAgentSpecs(message.agent) ? message.agent.color : "#B4D5FF";
  const contrastColor = getContrastColor(color);

  // == Hook ======================================================================
  const { chat } = useChat();
  const { isOpen, onClose, onOpen } = useDisclosure();

  // == Handler ===================================================================
  const handleDelete = () => chat.removeMessage(message.id);
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
