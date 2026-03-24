import {
  LayoutDashboard,
  Monitor,
  Package,
  FolderTree,
  Percent,
  ListVideo,
  CalendarClock,
  Database,
  ScrollText,
  Settings,
} from "lucide-react";

export interface SidebarItem {
  name: string;
  icon: any;
  path: string;
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

export const sidebarMenu: SidebarGroup[] = [
  {
    label: "MENU",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Screens", icon: Monitor, path: "/screens" },
      { name: "Products", icon: Package, path: "/products" },
      { name: "Categories", icon: FolderTree, path: "/categories" },
      { name: "Offers", icon: Percent, path: "/offers" },
      { name: "Playlists", icon: ListVideo, path: "/playlists" },
      { name: "Schedules", icon: CalendarClock, path: "/schedules" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { name: "Data Sync", icon: Database, path: "/ingestion" },
      { name: "Logs", icon: ScrollText, path: "/logs" },
      { name: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];
