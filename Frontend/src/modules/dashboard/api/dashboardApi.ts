import { apiSlice } from "@/shared/api/apiSlice";
import { DashboardData } from "../types/dashboard.types";

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getDashboard: builder.query<DashboardData, void>({
      query: () => "/dashboard",
      providesTags: ["Dashboard"],
    }),

  }),
});

export const {
  useGetDashboardQuery
} = dashboardApi;