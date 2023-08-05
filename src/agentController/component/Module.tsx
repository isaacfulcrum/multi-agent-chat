import { Icon } from "@chakra-ui/react";
import { MdPeopleOutline } from "react-icons/md";

import { SidebarModule, SidebarModules } from "@/sidebar/type";

import { AgentCreation } from "./AgentCreation";
import { AgentList } from "./AgentList";

/** all agent list related functionality */
// ********************************************************************************
export const AgentModule: SidebarModule = {
  name: SidebarModules.Settings,
  icon: <Icon as={MdPeopleOutline} />,
  sections: [
    {
      title: "New Agent",
      children: <AgentCreation />
    },
    {
      title: "Agent List",
      children: <AgentList />
    }
  ]

}
