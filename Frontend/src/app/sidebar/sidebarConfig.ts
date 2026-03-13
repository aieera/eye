import {
  LayoutDashboard,
  Monitor,
  Package,
  Tag,
  Percent,
  ListVideo,
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
      { name: "Brands", icon: Tag, path: "/brands" },
      { name: "Offers", icon: Percent, path: "/offers" },
      { name: "Playlist", icon: ListVideo, path: "/playlists" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { name: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];