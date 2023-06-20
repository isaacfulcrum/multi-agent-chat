import { CardHeader, Text } from "@chakra-ui/react";

type Props = {};

export const ChatHeader = (props: Props) => {
  return (
    <CardHeader>
      <Text fontSize="2xl" fontWeight="bold" color="white">
        Chat
      </Text>
    </CardHeader>
  );
};
