import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Checkbox,
  Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Flex,  Heading } from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";

import { agentServiceInstance } from "../service";

import { Agent } from "../type";

// ********************************************************************************
type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const AgentDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  // === State ====================================================================
  const [agents, setAgents] = useState<Agent[]>([]);

  // === Effect ===================================================================
  /** subscribe to agents changes */
  useEffect(() => {
    const subscription = agentServiceInstance.onAgents$().subscribe((newAgents) => {
      setAgents(newAgents);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // === Handler ==================================================================
  const handleAgentToggle = (e: ChangeEvent<HTMLInputElement>, agent: Agent) => {
    agentServiceInstance.updateAgent({ ...agent, isActive: e.target.checked });
  };

  return (
    <Drawer onClose={onClose} isOpen={isOpen} size="sm">
      <DrawerOverlay />
      <DrawerContent color="white" bg="#343541">
        <DrawerCloseButton />
        <DrawerHeader>Active Agents</DrawerHeader>
        <DrawerBody>
          <Accordion allowMultiple>
            {agents.map((agent) => (
              <AccordionItem width="100%" key={agent.id}>
                <Flex width="100%" align="center" gap="1em">
                  <Checkbox size="lg" colorScheme="teal" isChecked={agent.isActive} onChange={(e) => handleAgentToggle(e, agent)} />
                  <Heading as="h2" flex="1">
                    <AccordionButton>
                      <Box as="span" flex="1" textAlign="left" p="3" fontWeight="bold">
                        {agent.name}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </Heading>
                </Flex>
                <AccordionPanel pb={4}>{agent.description}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
