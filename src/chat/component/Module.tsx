import { Icon } from "@chakra-ui/react";
import { MdOutlineChat } from "react-icons/md";

import { SidebarModule, SidebarModules } from "@/sidebar/type";

import { ChatModeComponent } from "./Mode";

/** all chat related functionality */
// ********************************************************************************
export const ChatModule: SidebarModule = {
  name: SidebarModules.Chat,
  icon: <Icon as={MdOutlineChat} />,
  sections: [
    {
      title: "Chat Mode",
      children: <ChatModeComponent />
    }
  ]

}
