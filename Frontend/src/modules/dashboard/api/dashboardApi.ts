import { apiSlice } from "@/shared/api/apiSlice";

export interface ScreenStats {
  total: number;
  online: number;
  offline: number;
  error: number;
}

export interface DashboardStats {
  screens: ScreenStats;
  products: { total: number; withImages: number; withoutImages: number; synced: number };
  offers: { active: number };
  playlists: { total: number; published: number };
  lastSync: {
    id: string;
    syncType: string;
    status: string;
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsFailed: number;
    startedAt: string;
    completedAt: string | null;
    connection: { name: string } | null;
  } | null;
  errors: { system: number; screen: number; total: number };
}

export interface ActivityItem {
  id: string;
  type: "system" | "screen";
  level?: string;
  module?: string;
  action?: string;
  message?: string;
  eventType?: string;
  screen?: { screenName: string };
  timestamp: string;
}

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => "/dashboard/stats",
      transformResponse: (res: any) => res.data,
      providesTags: ["Dashboard"],
    }),
    getRecentActivity: builder.query<ActivityItem[], number | void>({
      query: (limit = 15) => `/dashboard/activity?limit=${limit}`,
      transformResponse: (res: any) => res.data,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetRecentActivityQuery } = dashboardApi;
