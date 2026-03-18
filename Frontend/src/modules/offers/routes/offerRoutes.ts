import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const OffersPage = lazy(() => import("../pages/Offers"));

export const offerRoutes: ModuleRoute[] = [
  {
    path: "/offers",
    element: OffersPage,
    protected: true,
  }
];