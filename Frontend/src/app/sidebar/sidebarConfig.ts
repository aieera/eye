import type { SidebarItem, SidebarChildItem, SidebarParentGroup } from "@/shared/types/sidebar";
import { Package } from "lucide-react";
import { productSidebarChildren } from "@/modules/product";

// Static parent groups - modules register children under these
const staticParentGroups: SidebarParentGroup[] = [
  {
    id: "sales",
    title: "Sales",
    icon: undefined, // Will be set in AppSidebar iconMap
    order: 20,
    children: [
      { title: "Customers", path: "/customers", order: 1 },
      { title: "Leads", path: "/sales/leads", order: 2 },
      ...productSidebarChildren, // Products module registers here
      { title: "Orders", path: "/sales/orders", order: 30 },
      { title: "Invoices", path: "/sales/invoices", order: 40 },
    ],
  },
  {
    id: "purchase",
    title: "Purchase",
    icon: undefined,
    order: 30,
    children: [
      { title: "Vendors", path: "/purchase/vendors", order: 1 },
      { title: "Purchase Orders", path: "/purchase/orders", order: 2 },
    ],
  },
];

// Static standalone items (no children)
const staticStandaloneItems: SidebarItem[] = [
  {
    title: "Dashboard",
    path: "/",
    order: 1,
  },
  {
    title: "Settings",
    path: "/settings",
    order: 99,
  },
];

export const getSidebarItems = (): SidebarItem[] => {
  // Convert parent groups to SidebarItem format
  const parentGroupItems: SidebarItem[] = staticParentGroups.map((group) => ({
    title: group.title,
    icon: group.icon,
    order: group.order,
    children: group.children
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
      .map((child) => ({
        title: child.title,
        path: child.path,
        order: child.order,
      })),
  }));

  const allItems = [...staticStandaloneItems, ...parentGroupItems];
  return allItems.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
};
