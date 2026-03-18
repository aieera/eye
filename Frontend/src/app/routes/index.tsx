import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Loader from "@/shared/components/Loader";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import { authRoutes } from "@/modules/auth";
import { screenRoutes } from "@/modules/screens/routes/screenRoutes";
import type { ModuleRoute } from "@/shared/types/route";
import MainLayout from "@/app/layouts/MainLayout";
import { playlistRoutes } from "@/modules/playlists/routes/playlistRoutes";
import { productRoutes } from "@/modules/products/routes/productRoutes";
import { offerRoutes } from "@/modules/offers/routes/offerRoutes";
import { brandRoutes } from "@/modules/brands/routes/brandRoutes";

const protectedRoutes: ModuleRoute[] = [
  ...screenRoutes,
  ...playlistRoutes,
  ...productRoutes,
  ...offerRoutes,
  ...brandRoutes
  
];

const AppRoutes = () => (
  <Suspense fallback={<Loader />}>
    <Routes>

      <Route path="/" element={<Navigate to="/screens" replace />} />
      

      {/* Auth routes */}
      {authRoutes.map((route) => {
        const Element = route.element;
        return (
          <Route
            key={route.path}
            path={route.path}
            element={<Element />}
          />
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
            <Route
              key={route.path}
              path={route.path}
              element={<Element />}
            />
          );
        })}
      </Route>

      <Route path="*" element={<Navigate to="/auth/login" replace />} />

    </Routes>
  </Suspense>
);

export default AppRoutes;