import { PropsWithChildren, ReactNode } from "react";

// ********************************************************************************
export enum SidebarModules {
  Modes = "Modes",
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
