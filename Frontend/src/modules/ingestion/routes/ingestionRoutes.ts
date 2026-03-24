import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

const Ingestion = lazy(() => import("../pages/Ingestion"));
const ConnectionForm = lazy(() => import("../pages/ConnectionForm"));
const FieldMapping = lazy(() => import("../pages/FieldMapping"));
const SyncLogs = lazy(() => import("../pages/SyncLogs"));

export const ingestionRoutes: ModuleRoute[] = [
  { path: "/ingestion", element: Ingestion, protected: true },
  { path: "/ingestion/new", element: ConnectionForm, protected: true },
  { path: "/ingestion/:id", element: ConnectionForm, protected: true },
  { path: "/ingestion/:id/mappings", element: FieldMapping, protected: true },
  { path: "/ingestion/:id/logs", element: SyncLogs, protected: true },
];
