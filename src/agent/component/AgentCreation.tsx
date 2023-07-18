import { ChangeEvent, FormEvent, useState } from "react";
import { AbsoluteCenter, Box, Button, Divider, Input, Stack, Textarea } from "@chakra-ui/react";

import { getRandomHex } from "@/utils/colors";
import { agentServiceInstance } from "../service";
import { toast } from "react-toastify";

// *******************************************************************************
export const AgentCreation = () => {
  // === State ================================================================
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
  });
  const isValid = newAgent.name.trim() !== "" && newAgent.description.trim() !== "";

  // === Handlers =============================================================
  const changeNewAgent = (key: "name" | "description", value: string) => setNewAgent({ ...newAgent, [key]: value });

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => changeNewAgent("name", e.target.value);

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    changeNewAgent("description", e.target.value);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const color = getRandomHex();
    try {
      await agentServiceInstance.newAgent({ ...newAgent, color });
      setNewAgent({ name: "", description: "" });
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
          <Input placeholder="Name" value={newAgent.name} onChange={handleNameChange} backgroundColor="#40414f" />
          <Textarea placeholder="Description" value={newAgent.description} onChange={handleDescriptionChange} backgroundColor="#40414f" />
          <Button colorScheme="teal" variant="solid" type="submit" isDisabled={!isValid}>
            Create
          </Button>
        </Stack>
      </form>
    </Box>
  );
};
