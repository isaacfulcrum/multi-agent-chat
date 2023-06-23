import { ChangeEvent, useEffect, useState } from "react";
import { Select } from "@chakra-ui/react";

import { agentServiceInstance } from "@/agent/service";

// ********************************************************************************
export const AgentSelect = () => {
  // === State ====================================================================
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);

  // === Effect ===================================================================
  /** subscribe to the current agent change event */
  useEffect(() => {
    // Update UI callback triggered when the agent changes ------------------------
    const unsubscribe = agentServiceInstance.onCurrentAgentChange((agent) =>
      setSelectedAgentId(agent?.id)
    );
    // Unsubscribe when the component is unmounted
    return () => unsubscribe();
  }, []);

  // === Handler ==================================================================
  const selectAgent = (e: ChangeEvent<HTMLSelectElement>) => agentServiceInstance.setCurrentAgent(e.target.value);

  return (
    <Select
    placeholder="Choose an agent"
    value={selectedAgentId}
    onChange={selectAgent}
    backgroundColor="white"
    maxWidth="300px"
    >
      {
        // Agent list options
        agentServiceInstance.agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))
      }
    </Select>
  );
};
