import { lazy } from "react";
import type { ModuleRoute } from "@/shared/types/route";

export const authRoutes: ModuleRoute[] = [
    {
        path: "/auth/login",
        element: lazy(() => import("../pages/LoginPage")),
        protected: false,
    },
    {
        path: "/auth/forgot-password",
        element: lazy(() => import("../pages/ForgotPassword")),
        protected: false,
    },
    {
        path: "/auth/verify-otp",
        element: lazy(() => import("../pages/VerifyOTP")),
        protected: false,
    },
    {
        path: "/auth/reset-password",
        element: lazy(() => import("../pages/ResetPassword")),
        protected: false,
    },
];