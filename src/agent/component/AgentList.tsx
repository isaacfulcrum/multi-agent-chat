import {
  AbsoluteCenter,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { agentServiceInstance } from "../service";

import { Agent } from "../type";

// ********************************************************************************
export const AgentList = () => {
  // === State ====================================================================
  const [agents, setAgents] = useState<Agent[]>([]);

  // === Effect ===================================================================
  /** subscribe to agents changes */
  useEffect(() => {
    const subscription = agentServiceInstance.onFirestoreAgents$().subscribe({
      next: (snapshot) => {
        setAgents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Agent)));
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
