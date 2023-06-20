import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import { getContrastColor } from "@/utils/colors";

type Props = {
  agentName: string;
  agentColor: string;
  message: string;
};

export const AgentMessage = ({ message, agentName, agentColor }: Props) => {
  // Contrast color for the agent message, so it's readable
  const contrastColor = getContrastColor(agentColor);

  return (
    <Box maxWidth="90%">
      <Flex gap="1em" padding="6">
        <Avatar
          name={agentName}
          backgroundColor={agentColor}
          color={contrastColor}
        />
        <Box
          backgroundColor={agentColor}
          color={contrastColor}
          padding="4"
          boxShadow="lg"
          borderRadius="lg"
        >
          <Text>{message}</Text>
        </Box>
      </Flex>
    </Box>
  );
};
