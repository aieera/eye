import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const Products = lazy(() => import("../pages/Products"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));

export const productRoutes: ModuleRoute[] = [
  {
    path: "/products",
    element: Products,
    protected: true,
  },
  {
    path: "/products/new",
    element: ProductDetail,
    protected: true,
  },
  {
    path: "/products/:id",
    element: ProductDetail,
    protected: true,
  },
];
