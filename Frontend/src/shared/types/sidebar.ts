import { type ReactNode } from "react";

export type SidebarChildItem = {
  title: string;
  path: string;
  order?: number;
  permissions?: string[];
};

export type SidebarItem = {
  title: string;
  icon?: ReactNode;
  path?: string;
  order?: number;
  children?: SidebarItem[];
  permissions?: string[];
};

// For static parent groups that accept child modules
export type SidebarParentGroup = {
  id: string;
  title: string;
  icon?: ReactNode;
  order?: number;
  children: SidebarChildItem[];
  permissions?: string[];
};
