import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const ScreensPage = lazy(() => import("../pages/ScreensPage"));
const ManageScreens = lazy(() => import("../pages/ManageScreens"));


export const screenRoutes: ModuleRoute[] = [
  {
    path: "/screens",
    element: ScreensPage,
    protected: true,
  },
  {
    path: "/screens/new",
    element: ManageScreens,
    protected: true,
  },
  {
    path: "/screens/:id",
    element: ManageScreens,
    protected: true,
  }

];