import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const DashboardPage = lazy(() => import("../pages/Dashboard"));

export const dashboardRoutes: ModuleRoute[] = [
  {
    path: "/dashboard",
    element: DashboardPage,
    protected: true,
  }
];