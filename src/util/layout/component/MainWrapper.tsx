import { PropsWithChildren } from 'react'
import { Flex } from '@chakra-ui/react'

import { Sidebar } from '@/sidebar/component'

/** main app wrapper */
// ********************************************************************************
export const MainWrapper: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <Flex
            width="100vw"
            height="100vh"
            justify="center"
            align="flex-end"
            bg="#343541"
            overflow="auto"
            position="relative"
        >
            {children}
            <Sidebar />
        </Flex>
    )
}

