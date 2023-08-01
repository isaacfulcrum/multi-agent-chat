import { Stack } from "@chakra-ui/react";

import { ApiKey } from "./ApiKey";

/** setting of the chat app
 * NOTE: for now, it only contains the api key, but it will be extended in the future*/
// ********************************************************************************
export const Settings = () => {
  return (
    <Stack width="100%" height="100%" px="1em">
      <ApiKey />
    </Stack>
  );
};
