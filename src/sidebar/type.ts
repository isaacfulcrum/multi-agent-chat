import { PropsWithChildren, ReactNode } from "react";

// ********************************************************************************
export enum SidebarModules {
  Chat = "Chat",
  Agents = "Agents",
  Settings = "Settings",
}

export type SidebarModuleSection = PropsWithChildren & {
  title: string;
};

export type SidebarModule = {
  name: SidebarModules;
  icon: ReactNode;
  sections: SidebarModuleSection[] /*list of sections*/;
};
