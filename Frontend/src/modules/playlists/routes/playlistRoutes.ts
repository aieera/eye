import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const Playlists = lazy(() => import("../pages/Playlists"));
const PlaylistBuilder = lazy(() => import("../pages/PlaylistBuilder"));

export const playlistRoutes: ModuleRoute[] = [
  {
    path: "/playlists",
    element: Playlists,
    protected: true,
  },
  {
    path: "/playlists/new",
    element: PlaylistBuilder,
    protected: true,
  },
  {
    path: "/playlists/:id",
    element: PlaylistBuilder,
    protected: true,
  },
];
