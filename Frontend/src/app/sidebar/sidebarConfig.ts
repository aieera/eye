import {
  LayoutDashboard,
  Monitor,
  Package,
  FolderTree,
  Percent,
  ListVideo,
  CalendarDays,
  RefreshCw,
  ScrollText,
  Settings2,
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
    label: "MAIN",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Screens", icon: Monitor, path: "/screens" },
      { name: "Products", icon: Package, path: "/products" },
      { name: "Categories", icon: FolderTree, path: "/categories" },
      { name: "Offers", icon: Percent, path: "/offers" },
    ],
  },
  {
    label: "CONTENT",
    items: [
      { name: "Playlists", icon: ListVideo, path: "/playlists" },
      { name: "Schedules", icon: CalendarDays, path: "/schedules" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { name: "Data Sync", icon: RefreshCw, path: "/ingestion" },
      { name: "Logs", icon: ScrollText, path: "/logs" },
      { name: "Settings", icon: Settings2, path: "/settings" },
    ],
  },
];
