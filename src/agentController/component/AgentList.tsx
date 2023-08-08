import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { AgentIdentifier, ConversationalAgentSpecs } from "@/agent/type";

import { AgentControllerService } from "../service";
import { DeleteButton } from "@/chat/component/Button";

// ********************************************************************************
export const AgentList = () => {
  // === State ====================================================================
  const [agents, setAgents] = useState<ConversationalAgentSpecs[]>([]);

  // === Effect ===================================================================
  /** subscribe to agents changes */
  useEffect(() => {
    const subscription = AgentControllerService.getInstance().onAgents$().subscribe({
      next: (snapshot) => setAgents(snapshot)
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // === Handlers =================================================================
  const deleteAgentHandler = async (agentId: AgentIdentifier) => {
    try {
      await AgentControllerService.getInstance().deleteAgent(agentId);
    } catch (error) {
      console.log(error);
      // TODO: /*show error toast*/
    }
  };

  return (
    <Box>
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
            <AccordionPanel pb={4}>
              {agent.description}
              <Stack direction="row" mt="1em">
                <DeleteButton onClick={() => deleteAgentHandler(agent.id)} />
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};
