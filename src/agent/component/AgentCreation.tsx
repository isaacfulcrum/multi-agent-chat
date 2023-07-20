import { ChangeEvent, FormEvent, useState } from "react";
import { AbsoluteCenter, Box, Button, Divider, Input, Stack, Textarea } from "@chakra-ui/react";

import { getRandomHex } from "@/utils/colors";
import { agentServiceInstance } from "../service";
import { toast } from "react-toastify";

// *******************************************************************************
export const AgentCreation = () => {
  // === State ================================================================
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const isValid = agentName.trim() !== "" && agentDescription.trim() !== "";

  // === Handlers =============================================================
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => setAgentName(e.target.value);
  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => setAgentDescription(e.target.value);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const color = getRandomHex();
    try {
      await agentServiceInstance.newAgent({ name: agentName, description: agentDescription, color });
      toast.success("Agent created successfully");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box px="1em">
      <Box position="relative" py="10">
        <Divider />
        <AbsoluteCenter bg="#1F2123" px="4">
          Create Agent
        </AbsoluteCenter>
      </Box>
      <form onSubmit={handleSubmit}>
        <Stack spacing="4">
          <Input placeholder="Name" value={agentName} onChange={handleNameChange} backgroundColor="#40414f" />
          <Textarea placeholder="Description" value={agentDescription} onChange={handleDescriptionChange} backgroundColor="#40414f" />
          <Button colorScheme="teal" variant="solid" type="submit" isDisabled={!isValid}>
            Create
          </Button>
        </Stack>
      </form>
    </Box>
  );
};
