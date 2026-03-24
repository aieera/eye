import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const Dashboard = lazy(() => import("../pages/Dashboard"));

export const dashboardRoutes: ModuleRoute[] = [
  { path: "/dashboard", element: Dashboard },
];
