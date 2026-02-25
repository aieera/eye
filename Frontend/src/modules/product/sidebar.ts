import type { SidebarChildItem } from "@/shared/types/sidebar";

// Product module registers its children under the Sales parent group
export const productSidebarChildren: SidebarChildItem[] = [
  { title: "Products", path: "/products", order: 10 },
];
