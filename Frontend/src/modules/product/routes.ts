import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const ProductListPage = lazy(() => import("./pages/ProductListPage"));
const ProductCreatePage = lazy(() => import("./pages/ProductCreatePage"));
const ProductEditPage = lazy(() => import("./pages/ProductEditPage"));

export const productRoutes: ModuleRoute[] = [
  {
    path: "/products",
    element: ProductListPage,
    protected: true,
  },
  {
    path: "/products/create",
    element: ProductCreatePage,
    protected: true,
  },
  {
    path: "/products/edit/:id",
    element: ProductEditPage,
    protected: true,
  },
];