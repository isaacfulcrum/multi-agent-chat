import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import { Box, IconButton, Tab, TabList, TabPanel, TabPanels, Tabs, useColorModeValue, useDisclosure } from "@chakra-ui/react";

import { Logs } from "@/log/component/Logs";
import { AgentMenu } from "@/agent/component/AgentMenu";

// *******************************************************************************
const SIDEBAR_WIDTH = "360px";

export const Sidebar = () => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });
  const [tabIndex, setTabIndex] = useState(0)
  // === Background Color =========================================================
  const colors = ["#FCFCFC",/*Logs*/, "#1F2123"/*Agents*/];
  const bg = colors[tabIndex]

  // === Handler ==================================================================
  const handleTabChange = (index: number) => {
    setTabIndex(index)
  }

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
        backgroundColor={bg}
        transition="all 0.2s ease"
      >
        <Tabs flex="1" defaultIndex={0} colorScheme="teal" minW={SIDEBAR_WIDTH} variant="solid-rounded" onChange={handleTabChange}>
          <TabList px="1em">
            <Tab>Logs</Tab>
            <Tab>Agents</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px="0">
              <Logs />
            </TabPanel>
            <TabPanel px="0">
              <AgentMenu />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
};
