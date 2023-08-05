import { Icon, Stack } from "@chakra-ui/react";
import { MdSettings } from "react-icons/md";

import { ApiKey } from "./ApiKey";
import { SidebarModule, SidebarModules } from "@/sidebar/type";

/** setting of the chat app
 * NOTE: for now, it only contains the api key, but it will be extended in the future*/
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
