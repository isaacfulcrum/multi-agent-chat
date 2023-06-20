import { Box, Flex, SkeletonCircle, SkeletonText } from "@chakra-ui/react";

export const Skeleton = () => {
  return (
    <Flex gap="1em" padding="6" boxShadow="lg" bg="gray.600" borderRadius="lg">
      <SkeletonCircle size="10" />
      <Box flex={1}>
        <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
      </Box>
    </Flex>
  );
};
