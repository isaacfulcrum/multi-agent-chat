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
    <Flex gap="1em" px="6" pt="2" justify="end" role="group">
      <Stack maxWidth="90%">
        <Box backgroundColor="teal" color="white" padding="4" boxShadow="lg" borderRadius="lg">
          <Text whiteSpace="pre-line">{message.content}</Text>
        </Box>
        <Flex width="100%" justify="flex-start" minH="1.5em">
          <Flex gap="0.5em" display="none" _groupHover={{ display: "flex" }}>
            <EditButton onClick={handleEdit} />
            <DeleteButton onClick={handleDelete} />
          </Flex>
        </Flex>
      </Stack>
      <EditModal message={message} isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
};
