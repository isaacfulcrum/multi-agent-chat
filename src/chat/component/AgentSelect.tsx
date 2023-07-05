import { ChangeEvent, useEffect, useState } from "react";
import { Flex, Select } from "@chakra-ui/react";

import { agentServiceInstance } from "@/agent/service";

// ********************************************************************************
export const AgentSelect = () => {
  // === State ====================================================================
  const [currentAgentId, setCurrentAgentId] = useState<string | undefined>(undefined);

  // === Effect ===================================================================
  /** subscribe to active agent changes */
  useEffect(() => {
    const subscription = agentServiceInstance.onSelectedAgent$().subscribe((agent) => {
      setCurrentAgentId(agent?.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  // === Handler ==================================================================
  const selectAgent = (e: ChangeEvent<HTMLSelectElement>) => {
    const agentId = e.target.value;
    const agent = agentServiceInstance.getAgent(agentId);
    agentServiceInstance.setSelectedAgent(agent);
  };

  return (
    <Flex gap="1em">
      <Select 
        placeholder="No agent" 
        value={currentAgentId} 
        onChange={selectAgent} 
        backgroundColor="#40414f" 
        color="white" 
        maxW="300px"
      >
        {
          // Agent list options
          agentServiceInstance.getAgents().map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))
        }
      </Select>
    </Flex>
  );
};
