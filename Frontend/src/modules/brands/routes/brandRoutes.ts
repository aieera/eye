import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const Brands = lazy(() => import("../pages/Brands"));

export const brandRoutes: ModuleRoute[] = [
  {
    path: "/brands",
    element: Brands,
    protected: true,
  }
];