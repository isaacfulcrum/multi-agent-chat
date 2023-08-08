import { ChangeEvent, FormEvent, useState } from "react";
import { Button, Input, Select, Stack, Textarea, useToast } from "@chakra-ui/react";

import { getRandomHex } from "@/util/colors";

import { useIsMounted } from "@/shared/hook/useIsMounted";
import { AgentControllerService } from "../service";
import { AgentType, isAgentType } from "@/agent/type";

// *******************************************************************************
export const AgentCreation = () => {
  const toast = useToast();
  const isMounted = useIsMounted();
  // === State ================================================================
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [agentType, setAgentType] = useState("");
  const isValid = agentName.trim() !== "" && agentDescription.trim() !== "" && agentType.trim() !== "";

  // === Handlers =============================================================
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => setAgentName(e.target.value);
  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => setAgentDescription(e.target.value);
  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => setAgentType(e.target.value);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const color = getRandomHex();
    try {
      if (!isAgentType(agentType)) throw new Error(`Invalid agent type: ${agentType}`);
      await AgentControllerService.getInstance().newAgent({ name: agentName, description: agentDescription, color, type: agentType });
      if (!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;
      toast({ title: "Agent created", status: "success", description: `Agent ${agentName} created` });
      setAgentName(""); setAgentDescription("");

    } catch (error) {
      console.log(error);
      toast({ status: "error", title: "Error", description: "An error occured while creating the agent" });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing="4">
        <Input placeholder="Name" value={agentName} onChange={handleNameChange} backgroundColor="#40414f" />
        <Textarea placeholder="Description" value={agentDescription} onChange={handleDescriptionChange} backgroundColor="#40414f" />
        <Select placeholder="Select type" backgroundColor="#40414f" value={agentType} onChange={handleTypeChange}>
          {/* map agent types */
            Object.entries(AgentType).map(([key, value]) => (
              <option key={value} value={value}>{key}</option>
            ))}
        </Select>
        <Button colorScheme="teal" variant="solid" type="submit" isDisabled={!isValid}>
          Create
        </Button>
      </Stack>
    </form>
  );
};
