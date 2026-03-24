import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const Schedules = lazy(() => import("../pages/Schedules"));

export const scheduleRoutes: ModuleRoute[] = [
  {
    path: "/schedules",
    element: Schedules,
    protected: true,
  },
];
