import { AbsoluteCenter, Box, Code, Divider, Fade, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

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
    <Stack bg="#FCFCFC" width="100%" height="100%">
      {logs.map((log, index) => (
        <Fade in={true} key={index}>
          <Box key={index} pl="1em" pr="2em" py="5px">
            <Code
              p="0.5em"
              width="100%"
              fontSize="sm"
              colorScheme="none"
              whiteSpace="pre-line"
              color={log.type === LogType.error ? "red" : "#333333"}
            >
              <Box position="relative" padding="4">
                <Divider w="100%" />
                <AbsoluteCenter bg="white" px="4">
                  <Text fontSize="xs">{log.sender}</Text>
                </AbsoluteCenter>
              </Box>
              <Text fontSize="11px">{log.message}</Text>
            </Code>
          </Box>
        </Fade>
      ))}
    </Stack>
  );
};
