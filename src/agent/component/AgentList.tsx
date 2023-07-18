import {
  AbsoluteCenter,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Checkbox,
  Divider,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";

import { agentServiceInstance } from "../service";

import { Agent } from "../type";

// ********************************************************************************
export const AgentList = () => {
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
    <Box>
      <Box position="relative" py="10" px="1em">
        <Divider />
        <AbsoluteCenter bg="#1F2123" px="4">
          List
        </AbsoluteCenter>
      </Box>
      <Text pb="5" px="1em">Select the agents you want to use for automatic completion.</Text>
      <Accordion allowMultiple>
        {agents.map((agent) => (
          <AccordionItem width="100%" key={agent.id}>
            <Flex width="100%" align="center" gap="1em">
              {/* <Checkbox
                size="lg"
                colorScheme="teal"
                isChecked={agent.isActive}
                onChange={(e) => handleAgentToggle(e, agent)}
              /> */}
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
    </Box>
  );
};
