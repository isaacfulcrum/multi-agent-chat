import { Icon } from "@chakra-ui/react";
import { MdOutlineBugReport } from "react-icons/md";

import { SidebarModule, SidebarModules } from "@/sidebar/type";

import { Logs } from "./Logs";

/** all log list related functionality */
// ********************************************************************************
export const LogsModule: SidebarModule = {
  name: SidebarModules.Logs,
  icon: <Icon as={MdOutlineBugReport} />,
  sections: [
    {
      title: "Logs",
      children: <Logs />
    },
  ]

}
