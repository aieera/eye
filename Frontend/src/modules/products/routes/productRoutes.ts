import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const Products = lazy(() => import("../pages/Products"));

export const productRoutes: ModuleRoute[] = [
  {
    path: "/products",
    element: Products,
    protected: true,
  }

];