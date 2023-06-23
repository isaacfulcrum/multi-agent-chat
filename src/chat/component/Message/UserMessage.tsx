import { Box, Flex, Text } from "@chakra-ui/react";

import { UserChatMessage } from "@/chat/type";

// ********************************************************************************
export const UserMessage: React.FC<UserChatMessage> = ({ content }) => {
  return (
    <Flex gap="1em" px="6" py="2" justify="end">
      <Box
        backgroundColor="teal"
        color="white"
        padding="4"
        boxShadow="lg"
        borderRadius="lg"
        maxWidth="90%"
      >
        <Text textAlign="right">{content}</Text>
      </Box>
    </Flex>
  );
};
