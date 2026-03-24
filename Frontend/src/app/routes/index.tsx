import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Loader from "@/shared/components/Loader";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import { authRoutes } from "@/modules/auth";
import { screenRoutes } from "@/modules/screens/routes/screenRoutes";
import { productRoutes } from "@/modules/products/routes/productRoutes";
import { playlistRoutes } from "@/modules/playlists/routes/playlistRoutes";
import { categoryRoutes } from "@/modules/categories/routes/categoryRoutes";
import { offerRoutes } from "@/modules/offers/routes/offerRoutes";
import { scheduleRoutes } from "@/modules/schedules/routes/scheduleRoutes";
import { ingestionRoutes } from "@/modules/ingestion/routes/ingestionRoutes";
import { dashboardRoutes } from "@/modules/dashboard/routes/dashboardRoutes";
import { logRoutes } from "@/modules/logs/routes/logRoutes";
import { settingsRoutes } from "@/modules/settings/routes/settingsRoutes";
import type { ModuleRoute } from "@/shared/types/route";
import MainLayout from "@/app/layouts/MainLayout";

const protectedRoutes: ModuleRoute[] = [
  ...dashboardRoutes,
  ...screenRoutes,
  ...productRoutes,
  ...playlistRoutes,
  ...categoryRoutes,
  ...offerRoutes,
  ...scheduleRoutes,
  ...ingestionRoutes,
  ...logRoutes,
  ...settingsRoutes,
];

const AppRoutes = () => (
  <Suspense fallback={<Loader />}>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth routes */}
      {authRoutes.map((route) => {
        const Element = route.element;
        return (
          <Route key={route.path} path={route.path} element={<Element />} />
        );
      })}

      {/* Protected layout routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {protectedRoutes.map((route) => {
          const Element = route.element;
          return (
            <Route key={route.path} path={route.path} element={<Element />} />
          );
        })}
      </Route>

      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
