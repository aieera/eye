import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Loader from "@/shared/components/Loader";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import MainLayout from "@/app/layouts/MainLayout";
import { authRoutes } from "@/modules/auth";
import { productRoutes } from "@/modules/product";
import type { ModuleRoute } from "@/shared/types/route";

const allRoutes: ModuleRoute[] = [...authRoutes, ...productRoutes];

const AppRoutes = () => (
  <Suspense fallback={<Loader />}>
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      {allRoutes.map((route) => {
        const Element = route.element;
        const wrapped = route.protected ? (
          <ProtectedRoute>
            <MainLayout>
              <Element />
            </MainLayout>
          </ProtectedRoute>
        ) : (
          <Element />
        );

        return <Route key={route.path} path={route.path} element={wrapped} />;
      })}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
