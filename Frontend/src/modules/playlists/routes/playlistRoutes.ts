import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const Playlists = lazy(() => import("../pages/Playlists"));

export const playlistRoutes: ModuleRoute[] = [
  {
    path: "/playlists",
    element: Playlists,
    protected: true,
  }

];