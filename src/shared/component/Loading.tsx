import { Center, Spinner } from '@chakra-ui/react'

/** Renders a loading spinner in the center of the screen */
// ******************************************************************************
export const Loading = () => {
  return (
    <Center flex="1" height="100%">
      <Spinner size="xl" color='teal' />
    </Center>
  )
}