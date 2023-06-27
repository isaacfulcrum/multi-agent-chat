import { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Textarea } from "@chakra-ui/react";

import { ChatMessage } from "@/chat/type";
import { chatServiceInstance } from "@/chat/service";

// ********************************************************************************
type Props = {
  isOpen: boolean;
  onClose: () => void;
  message: ChatMessage;
};

export const EditModal: React.FC<Props> = ({ isOpen, onClose, message }) => {
  // == State ===================================================================
  const [content, setContent] = useState<string>("");

  // == Effect ==================================================================
  useEffect(() => {
    if (isOpen) setContent(message.content);
  }, [isOpen, message.content]);

  // == Handler =================================================================
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleEditMessage = () => {
    chatServiceInstance.updateMessage({ ...message, content });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" motionPreset='slideInBottom'>
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg="gray.800">
        <ModalHeader color="white">Update message</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Textarea
            value={content}
            onChange={handleInputChange}
            placeholder="Type here..."
            backgroundColor="white"
            autoFocus
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="teal" mr={3} onClick={handleEditMessage}>
            Apply
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
