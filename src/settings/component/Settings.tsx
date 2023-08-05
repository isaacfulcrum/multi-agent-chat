import { Icon } from "@chakra-ui/react";
import { MdSettings } from "react-icons/md";

import { ApiKey } from "./ApiKey";
import { SidebarModule, SidebarModules } from "@/sidebar/type";

/** general settings of the app */
// ********************************************************************************
export const Settings: SidebarModule = {
  name: SidebarModules.Settings,
  icon: <Icon as={MdSettings} />,
  sections: [
    {
      title: "API Key",
      children: <ApiKey />
    }
  ]

}
