import { Box, Code, Fade, Stack, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import { Log, LogType } from "../type";
import { logServiceInstance } from "../service";

//******************************************************************************
export const Logs = () => {
  // === State ====================================================================
  const [logs, setLogs] = useState<Log[]>([]);

  // === Effect ===================================================================
  /** subscribe to the logs updates */
  useEffect(() => {
    const subscription = logServiceInstance.onLog$().subscribe((newLogs) => {
      setLogs(newLogs);
    });
    // unsubscribe when the component is unmounted
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Stack>
      {logs.map((log, index) => (
        <Fade in={true} key={index}>
          <Box key={index} pl="1em" pr="2em" py="5px">
            <Code fontSize="sm" colorScheme={log.type === LogType.error ? "red" : "blue"} p={"0.5em"} width="100%" whiteSpace="pre-line">
              <Text fontSize="xs" color="gray.600">
                {log.sender}
              </Text>
              {log.message}
            </Code>
          </Box>
        </Fade>
      ))}
    </Stack>
  );
};
