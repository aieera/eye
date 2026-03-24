import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const Offers = lazy(() => import("../pages/Offers"));
const OfferDetail = lazy(() => import("../pages/OfferDetail"));

export const offerRoutes: ModuleRoute[] = [
  {
    path: "/offers",
    element: Offers,
    protected: true,
  },
  {
    path: "/offers/new",
    element: OfferDetail,
    protected: true,
  },
  {
    path: "/offers/:id",
    element: OfferDetail,
    protected: true,
  },
];
