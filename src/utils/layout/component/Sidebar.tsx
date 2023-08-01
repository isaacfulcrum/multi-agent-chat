import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, SettingsIcon } from "@chakra-ui/icons";
import { Box, IconButton, Tab, TabList, TabPanel, TabPanels, Tabs, Tooltip, useColorModeValue, useDisclosure } from "@chakra-ui/react";

import { Logs } from "@/log/component/Logs";
import { AgentMenu } from "@/agent/component/AgentMenu";
import { Settings } from "@/chat/component/Settings";

// *******************************************************************************

const tabs = [
    {
        name: "Logs",
        icon: <ArrowLeftIcon />,
        component: <Logs />
    },
    {
        name: "Agents",
        icon: <ArrowLeftIcon />,
        component: <AgentMenu />
    },
    {
        name: "Settings",
        icon: <SettingsIcon />,
        component: <Settings />
    }
]

const SIDEBAR_WIDTH = "400px";

export const Sidebar = () => {
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
    const [tabIndex, setTabIndex] = useState(0)
    // === Background Color =========================================================
    // === Handler ==================================================================
    const handleTabChange = (index: number) => {
        setTabIndex(index)
    }

    return (
        <>
            {/* <IconButton
                top="1em"
                zIndex={10}
                aria-label="Menu"
                colorScheme="teal"
                onClick={onToggle}
                position="absolute"
                transition="all 0.3s ease"
                right={isOpen ? `calc(${SIDEBAR_WIDTH} + 1em)` : "1em"}
                icon={isOpen ? <ArrowLeftIcon /> : <ArrowRightIcon />}
            /> */}
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
                <Tabs flex="1" defaultIndex={0} colorScheme="gray" minW={SIDEBAR_WIDTH} variant="solid-rounded" onChange={handleTabChange} orientation="vertical">
                    <TabPanels>
                        {tabs.map((tab, index) => (
                            <TabPanel key={index} p={0} h="100vh" overflowY="auto" overflowX="hidden" backgroundColor="#17171C">
                                {tab.component}
                            </TabPanel>
                        ))}
                    </TabPanels>
                    <TabList px="1em" width="80px" borderLeftColor="gray.700" borderLeftWidth="0.5px" height="100vh" backgroundColor="#17171C">
                        {tabs.map((tab, index) => (
                            <Tooltip key={index} label={tab.name} placement="right" size="xl">
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
                                    {tab.icon}
                                </Tab>
                            </Tooltip>
                        ))}
                    </TabList>
                </Tabs>
            </Box>
        </>
    );
};
