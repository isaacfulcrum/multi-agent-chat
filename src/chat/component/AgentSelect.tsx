import { ChangeEvent, useState } from "react";
import { Button, Flex, Select } from "@chakra-ui/react";

import { agentServiceInstance } from "@/agent/service";
import { chatServiceInstance } from "../service";

// ********************************************************************************
export const AgentSelect = () => {
  // === State ====================================================================
  const [currentAgentId, setCurrentAgentId] = useState<string | undefined>(undefined);

  // === Handler ==================================================================
  const selectAgent = (e: ChangeEvent<HTMLSelectElement>) => setCurrentAgentId(e.target.value);
  const runCompletionHandler = async () => {
    try {
      const messages = chatServiceInstance.getCompletionMessages();
      const agent = agentServiceInstance.getAgent(currentAgentId ?? "");
      await chatServiceInstance.runCompletion(messages, agent);
    } catch (error) {
      // TODO: Handle error
      console.log(error);
    }
  };

  return (
    <Flex gap="1em">
      <Select placeholder="No agent" value={currentAgentId} onChange={selectAgent} backgroundColor="#40414f" color="white" maxWidth="300px">
        {
          // Agent list options
          agentServiceInstance.getAgents().map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))
        }
      </Select>
      <Button onClick={runCompletionHandler} width="200px" colorScheme="teal">
        Run completion
      </Button>
    </Flex>
  );
};
