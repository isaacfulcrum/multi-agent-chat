import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import { getContrastColor } from "@/utils/colors";
import { AssistantChatMessage } from "@/chat/type";

export const AgentMessage: React.FC<AssistantChatMessage> = (message) => {
  const color = message.isAgent ? message.agent.color : "teal";
  const contrastColor = message.isAgent ? getContrastColor(message.agent.color) : "white";
  return (
    <Box maxWidth="90%">
      <Flex gap="1em" px="6" py="2">
        <Avatar
          name={message.isAgent ? message.agent.name : "Chatbot"}
          backgroundColor={color}
          color={contrastColor}
        />
        <Box
          backgroundColor={color}
          color={contrastColor}
          padding="4"
          boxShadow="lg"
          borderRadius="lg"
        >
          <Text>{message.content}</Text>
        </Box>
      </Flex>
    </Box>
  );
};
