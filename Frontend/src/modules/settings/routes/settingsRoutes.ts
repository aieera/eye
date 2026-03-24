import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const Settings = lazy(() => import("../pages/Settings"));

export const settingsRoutes: ModuleRoute[] = [
  { path: "/settings", element: Settings },
];
