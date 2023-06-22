import { ChangeEvent, useEffect, useState } from "react";
import AgentServiceInstance from "@/agent/service";
import { Select } from "@chakra-ui/react";

export const AgentSelect = () => {
  // === State ====================================================================
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);

  // === Effect ===================================================================
  useEffect(() => {
    // Update UI callback triggered when the agent changes ------------------------
    const updateSelectedAgent = () => setSelectedAgentId(AgentServiceInstance.currentAgent?.id);
    const handleAgentChanged = () => updateSelectedAgent();
    // Subscribe to the message added event
    AgentServiceInstance.onAgentChanged = handleAgentChanged;
    // Unsubscribe from the message added event when the component unmounts
    return () => {
      AgentServiceInstance.onAgentChanged = undefined;
    };
  }, [selectedAgentId]);

  // === Handler ==================================================================
  const selectAgent = (e: ChangeEvent<HTMLSelectElement>) => AgentServiceInstance.setCurrentAgent(e.target.value);

  return (
    <Select
      isDisabled={false}
      placeholder="Default Agent"
      value={selectedAgentId}
      onChange={selectAgent}
      backgroundColor="white"
      maxWidth="300px"
    >
      {
        // Agent list options
        AgentServiceInstance.agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))
      }
    </Select>
  );
};

