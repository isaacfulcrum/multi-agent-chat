import { ChangeEvent, useEffect, useState } from "react";
import { Flex, IconButton, Input, Tooltip, useToast } from "@chakra-ui/react";

import { OpenAIService } from "@/openai/service";


// ********************************************************************************
const openai = new OpenAIService()

export const ApiKey = () => {
  const toast = useToast();
  // === State ====================================================================
  const [apiKey, setApiKey] = useState<string>("");

  // === Effect ===================================================================
  /** load api key from local storage */
  useEffect(() => {
    const apiKey = openai.getApiKey();
    if (apiKey) {
      setApiKey(apiKey);
    }
  }, []);

  // === Handler ==================================================================
  const handleApiKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const saveApiKeyHandler = async (e: ChangeEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      openai.storeApiKey(apiKey);
      toast({ title: "API Key saved", status: "success", description: `Your OpenAI API Key has been saved correctly` });
    } catch (error) {
      toast({ status: "error", title: "Error", description: "An error occured while saving your API Key" });
    }
  };

  return (
    <form onSubmit={saveApiKeyHandler}>
      <Flex gap="0.5em">
        <Input value={apiKey} onChange={handleApiKeyChange} placeholder="API Key" />
        <Tooltip label="Save">
          <IconButton aria-label="Save" icon={<>💾</>} colorScheme="teal" type="submit" />
        </Tooltip>
      </Flex>
    </form>
  );
};
