
import { AbsoluteCenter, Box, Divider } from "@chakra-ui/react";

import { SidebarModuleSection } from "../type";

/** Renders the basic structure of a module section in the sidebar. */
// *******************************************************************************
export const ModuleSection: React.FC<SidebarModuleSection> = ({ title, children }) => {
  return (
    <>
      <Box position="relative" py="10">
        <Divider />
        <AbsoluteCenter bg="#17171C" px="4">
          {title}
        </AbsoluteCenter>
      </Box>
      {children}
    </>);

};
