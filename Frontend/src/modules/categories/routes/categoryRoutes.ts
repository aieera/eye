import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const Categories = lazy(() => import("../pages/Categories"));

export const categoryRoutes: ModuleRoute[] = [
  {
    path: "/categories",
    element: Categories,
    protected: true,
  },
];
