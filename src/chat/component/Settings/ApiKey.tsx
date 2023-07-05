import { ChangeEvent, useEffect, useState } from "react";
import { AbsoluteCenter, Box, Divider, Flex, IconButton, Input, Tooltip } from "@chakra-ui/react";
import { toast } from "react-toastify";

import { getApiKey, storeApiKey } from "@/chat/type";

// ********************************************************************************
export const ApiKey = () => {
  // === State ====================================================================
  const [apiKey, setApiKey] = useState<string>("");

  // === Effect ===================================================================
  /** load api key from local storage */
  useEffect(() => {
    const apiKey = getApiKey();
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
      storeApiKey(apiKey);
      toast.success("API Key saved", {
        position: "bottom-right",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Box position="relative" py="10">
        <Divider />
        <AbsoluteCenter bg="#343541" px="4">
          OpenAI API Key
        </AbsoluteCenter>
      </Box>
      <form onSubmit={saveApiKeyHandler}>
        <Flex gap="0.5em">
          <Input value={apiKey} onChange={handleApiKeyChange} placeholder="API Key" />
          <Tooltip label="Save">
            <IconButton aria-label="Save" icon={<>💾</>} colorScheme="teal" type="submit" />
          </Tooltip>
        </Flex>
      </form>
    </>
  );
};
