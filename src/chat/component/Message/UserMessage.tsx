import { Box, Flex, Stack, Text, useDisclosure } from "@chakra-ui/react";

import { chatServiceInstance } from "@/chat/service";

import { UserChatMessage } from "@/chat/type";

import { DeleteButton, EditButton } from "../Button";
import { EditModal } from "./EditModal";

// ********************************************************************************
export const UserMessage: React.FC<UserChatMessage> = (message) => {
  // == Hook ======================================================================
  const { isOpen, onClose, onOpen } = useDisclosure();

  // == Handler ===================================================================
  const handleDelete = () => chatServiceInstance.removeMessage(message.id);
  const handleEdit = () => onOpen();

  return (
    <Flex gap="1em" px="6" py="2" justify="end">
      <Stack  maxWidth="90%">
        <Box
          backgroundColor="teal"
          color="white"
          padding="4"
          boxShadow="lg"
          borderRadius="lg"
        >
          <Text textAlign="right">{message.content}</Text>
        </Box>
        <Flex width="100%" gap="0.5em" justify="flex-end">
          <EditButton onClick={handleEdit} />
          <DeleteButton onClick={handleDelete} />
        </Flex>
      </Stack>
      <EditModal message={message} isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
};
