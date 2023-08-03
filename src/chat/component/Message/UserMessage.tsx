import { Box, Flex, Stack, Text, useDisclosure } from "@chakra-ui/react";

import { UserChatMessage } from "@/chat/type";
import { useChat } from "@/chat/hook/useChat";

import { DeleteButton, EditButton } from "../Button";
import { EditModal } from "./EditModal";

// ********************************************************************************
export const UserMessage: React.FC<UserChatMessage> = (message) => {
  // == Hook ======================================================================
  const { chat } = useChat();
  const { isOpen, onClose, onOpen } = useDisclosure();

  // == Handler ===================================================================
  const handleDelete = () => chat.removeMessage(message.id);
  const handleEdit = () => onOpen();

  return (
    <Flex gap="0.5em" px="6" py="1" justify="end" role="group">
      <Stack gap="0.5em" display="none" _groupHover={{ display: "flex" }}>
        <EditButton onClick={handleEdit} />
        <DeleteButton onClick={handleDelete} />
      </Stack>
      <Box backgroundColor="teal" color="white" padding="4" boxShadow="lg" borderRadius="lg" maxWidth="90%">
        <Text whiteSpace="pre-line">{message.content}</Text>
      </Box>
      <EditModal message={message} isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
};
