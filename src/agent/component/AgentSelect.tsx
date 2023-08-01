import { ChangeEvent, useEffect, useState } from "react";
import { Flex, Select } from "@chakra-ui/react";

// import { agentServiceInstance } from "@/agent/service";
import { Agent } from "../type";

// ********************************************************************************
export const AgentSelect = () => {
  // === State ====================================================================
  const [agents, setAgents] = useState<Agent[]>([]);
  const [currentAgentId, setCurrentAgentId] = useState<string | undefined>(undefined);

  // === Effect ===================================================================
  /** subscribe to active agent changes */
  // useEffect(() => {
  //   const subscription = agentServiceInstance.onSelectedAgent$().subscribe((agent) => {
  //     setCurrentAgentId(agent?.id);
  //   });
  //   return () => subscription.unsubscribe();
  // }, []);
  // /* agent list */
  // useEffect(() => {
  //   const subscription = agentServiceInstance.onAgents$().subscribe((agents) => {
  //     setAgents(agents);
  //   });
  //   return () => subscription.unsubscribe();
  // }, []);

  // === Handler ==================================================================
  const selectAgent = (e: ChangeEvent<HTMLSelectElement>) => {
    // agentServiceInstance.setSelectedAgent(e.target.value);
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
          agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))
        }
      </Select>
    </Flex>
  );
};
