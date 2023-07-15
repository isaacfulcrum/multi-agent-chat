import { PropsWithChildren } from "react";
import { Flex } from "@chakra-ui/react";
import { Sidebar } from "./Sidebar";
import { Settings } from "@/chat/component/Settings";

// *****************************************************************************
export const ToolbarLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Flex
      width="100vw"
      height="100vh"
      justify="center"
      align="flex-end"
      bg="#343541"
      overflow="auto"
      position="relative"
    >
      <Sidebar />
      <Settings />
      {children}
    </Flex>
  );
};
