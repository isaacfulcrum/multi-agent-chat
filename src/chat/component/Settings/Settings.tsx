import { SettingsIcon } from "@chakra-ui/icons";
import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, IconButton, useDisclosure } from "@chakra-ui/react";

import { ApiKey } from "./ApiKey";
import { AgentAccordion } from "@/agent/component/AgentAccordion";

// ********************************************************************************
export const Settings = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <IconButton aria-label="Select Agents" icon={<SettingsIcon />} colorScheme="teal" onClick={onOpen} />
      <Drawer onClose={onClose} isOpen={isOpen} size="sm">
        <DrawerOverlay />
        <DrawerContent color="white" bg="#343541">
          <DrawerCloseButton />
          <DrawerHeader>Chat Settings</DrawerHeader>
          <DrawerBody>
            <ApiKey />
            <AgentAccordion />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
