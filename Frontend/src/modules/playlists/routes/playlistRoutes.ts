import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const Playlists = lazy(() => import("../pages/Playlists"));
const ManagePlaylists = lazy(() => import("../pages/ManagePlaylists"));

export const playlistRoutes: ModuleRoute[] = [
  {
    path: "/playlists",
    element: Playlists,
    protected: true,
  },
  {
    path: "/playlists/new",
    element: ManagePlaylists,
    protected: true,
  },
  {
    path: "/playlists/:id",
    element: ManagePlaylists,
    protected: true,
  }


];