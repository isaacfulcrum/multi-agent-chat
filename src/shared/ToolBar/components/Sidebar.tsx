import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import { Box, IconButton, Tab, TabList, TabPanel, TabPanels, Tabs, useDisclosure } from "@chakra-ui/react";

import { Logs } from "@/log/component/Logs";

// *******************************************************************************
const SIDEBAR_WIDTH = "360px";

export const Sidebar = () => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });

  return (
    <>
      <IconButton
        top="1em"
        zIndex={10}
        aria-label="Menu"
        colorScheme="teal"
        onClick={onToggle}
        position="absolute"
        transition="all 0.3s ease"
        left={isOpen ? `calc(${SIDEBAR_WIDTH} + 1em)` : "1em"}
        icon={isOpen ? <ArrowLeftIcon /> : <ArrowRightIcon />}
      />
      <Box
        py="1em"
        h="100vh"
        zIndex={10}
        color="white"
        overflowX="hidden"
        px={0}
        width={isOpen ? SIDEBAR_WIDTH : "0px"}
        backgroundColor="#FCFCFC"
        transition="all 0.3s ease"
      >
        <Tabs flex="1" defaultIndex={0} colorScheme="teal" minW={SIDEBAR_WIDTH} variant="solid-rounded">
          <TabList px="1em">
            <Tab>Logs</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px="0">
              <Logs />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
};
