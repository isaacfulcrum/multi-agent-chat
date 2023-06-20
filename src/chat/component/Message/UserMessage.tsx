import { Box, Flex, Text } from "@chakra-ui/react";

type Props = {
  message: string;
};

export const UserMessage = ({ message }: Props) => {
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
        <Text textAlign="right">{message}</Text>
      </Box>
    </Flex>
  );
};
