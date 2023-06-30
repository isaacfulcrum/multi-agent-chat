import { EditIcon } from "@chakra-ui/icons";
import { IconButton, useDisclosure } from "@chakra-ui/react";

import { AgentDrawer } from "./AgentDrawer";

// ********************************************************************************
export const AgentButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <IconButton aria-label="Select Agents" icon={<EditIcon />} colorScheme="teal" onClick={onOpen} />
      <AgentDrawer isOpen={isOpen} onClose={onClose} />
    </>
  );
};
