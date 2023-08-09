import { Box, Code, Fade, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { Log, LogType } from "../type";
import { LogControllerService } from "../service";
import { getContrastColor } from "@/util/colors";

//******************************************************************************
export const Logs = () => {
  // === State ====================================================================
  const [logs, setLogs] = useState<Log[]>([]);

  // === Effect ===================================================================
  /** subscribe to the logs updates */
  useEffect(() => {
    const subscription = LogControllerService.getInstance().onLog$().subscribe((newLogs) => {
      setLogs(newLogs);
    });
    // unsubscribe when the component is unmounted
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Stack width="100%" height="100%" borderRadius="sm" spacing={4}>
      {logs.map((log, index) => {
        const color = log.type === LogType.error ? "red" : log.color;
        const contrastColor = getContrastColor(color);

        return <Fade in={true} key={index}>
          <Box key={index} py="8px" borderBottom="1px solid #333333" borderRadius="sm" bg={color}>
            <Code
              px="1em"
              width="100%"
              fontSize="sm"
              colorScheme="none"
              whiteSpace="pre-line"
              color={contrastColor}
            >
              <Text fontSize="xs" fontWeight="bold">{log.sender}</Text>
              <Text fontSize="11px">{log.message}</Text>
            </Code>
          </Box>
        </Fade>
      }
      )}
    </Stack>
  );
};
