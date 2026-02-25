import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

export const authRoutes: ModuleRoute[] = [
  {
    path: "/auth/login",
    element: lazy(() => import("./pages/LoginPage")),
    protected: false,
  },
];
