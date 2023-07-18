import { ChangeEvent, FormEvent, useState } from "react";
import { AbsoluteCenter, Box, Button, Divider, Input, Stack, Textarea } from "@chakra-ui/react";

import { getRandomHex } from "@/utils/colors";

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const color = getRandomHex();
    console.log("Submit: ", { ...newAgent, color });
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
          <Input placeholder="Name" onChange={handleNameChange} backgroundColor="#40414f" />
          <Textarea placeholder="Description" onChange={handleDescriptionChange} backgroundColor="#40414f" />
          <Button colorScheme="teal" variant="solid" type="submit" isDisabled={!isValid}>
            Create
          </Button>
        </Stack>
      </form>
    </Box>
  );
};
