import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import { Box, IconButton, Tab, TabList, TabPanel, TabPanels, Tabs, useDisclosure } from "@chakra-ui/react";

// *******************************************************************************
const SIDEBAR_WIDTH = "300px";

export const Sidebar = () => {
  const { isOpen, onToggle } = useDisclosure();

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
        left={isOpen ? "1em" : `calc(${SIDEBAR_WIDTH} + 1em)`}
        icon={isOpen ? <ArrowRightIcon /> : <ArrowLeftIcon />}
      />
      <Box
        py="1em"
        h="100vh"
        zIndex={10}
        color="white"
        overflowX="hidden"
        px={isOpen ? "0px" : "1em"}
        width={isOpen ? "0px" : SIDEBAR_WIDTH}
        backgroundColor="#1F2123"
        transition="all 0.3s ease"
      >
        <Tabs flex="1" defaultIndex={0} colorScheme="teal" minW={SIDEBAR_WIDTH} variant="solid-rounded">
          <TabList>
            <Tab>Logs</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <p>Logs</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
};
