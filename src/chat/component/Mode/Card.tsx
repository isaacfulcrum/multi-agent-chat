import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Card, CardBody, CardHeader, Center, Flex, Heading, Icon, Link, Text } from '@chakra-ui/react'

import { ChatModeSpecs } from '@/chat/type'

// ******************************************************************************
export const ChatModeCard: React.FC<ChatModeSpecs> = ({ name, description, icon, link }) => {

  const route = useRouter()
  const isActive = route.pathname === link;
  
  return (
    <Link as={NextLink} href={link} passHref textDecoration="none !important">
      <Card py="1em" _hover={{
        transform: "scale(1.02)",
        transition: "all 0.2s ease"
      }}
        backgroundColor={isActive ? "teal" : "gray.700"}
        color="white"
      >
        <CardHeader py="4px">
          <Flex gap="1em" alignItems="center">
            <Center fontSize="2xl">
              <Icon as={icon} />
            </Center>
            <Heading as="h3" fontSize="sm" >
              {name}
            </Heading>
          </Flex>
        </CardHeader>
        <CardBody py="0">
          <Text fontSize="xs">{description}</Text>
        </CardBody>
      </Card>
    </Link>
  )
}