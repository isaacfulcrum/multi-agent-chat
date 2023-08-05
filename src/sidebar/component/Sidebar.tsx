import { Box, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Tooltip, useDisclosure } from "@chakra-ui/react";

import { Settings } from "@/settings/component";

import { ModuleSection } from "./ModuleSection";
import { SidebarModule } from "../type";

// *******************************************************************************
const modules: SidebarModule[] = [Settings]
const SIDEBAR_WIDTH = "400px";

/** Renders the sidebar of the app */
export const Sidebar = () => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true }); /** TODO: Sidebar should function in reduced mode on mobile devices */

  return (
    <Box
      h="100vh"
      zIndex={10}
      color="white"
      overflowX="hidden"
      px={0}
      width={isOpen ? SIDEBAR_WIDTH : "0px"}
      backgroundColor="#17171C"
      transition="all 0.2s ease"
    >
      <Tabs flex="1" defaultIndex={0} colorScheme="gray" minW={SIDEBAR_WIDTH} variant="solid-rounded" orientation="vertical">
        <TabPanels>
          {modules.map((tab, index) => (
            <TabPanel key={index} p={0} h="100vh" overflowY="auto" overflowX="hidden" backgroundColor="#17171C">
              <Stack px="1em">
                {tab.sections.map((section, index) => (
                  <ModuleSection key={index} title={section.title}>
                    {section.children}
                  </ModuleSection>
                ))}
              </Stack>
            </TabPanel>
          ))}
        </TabPanels>
        <TabList px="1em" width="80px" borderLeftColor="gray.700" borderLeftWidth="0.5px" height="100vh" backgroundColor="#17171C">
          {modules.map((module, index) => (
            <Tooltip key={index} label={module.name} placement="right" size="xl">
              <Tab
                width="40px"
                height="40px"
                my="0.5em"
                fontSize="xl"
                textAlign="center"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                {module.icon}
              </Tab>
            </Tooltip>
          ))}
        </TabList>
      </Tabs>
    </Box>
  );
};
