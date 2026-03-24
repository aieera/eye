import { apiSlice } from "@/shared/api/apiSlice";
import type {
  Screen,
  ScreenStats,
  CreateScreenPayload,
  ScreensListParams,
} from "../types/screens.types";

export const screensApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getScreens: builder.query<
      { data: Screen[]; meta: { pagination: any } },
      ScreensListParams | void
    >({
      query: (params) => ({
        url: "/screens",
        params: params || {},
      }),
      providesTags: ["Screens"],
    }),

    getScreenStats: builder.query<{ data: ScreenStats }, void>({
      query: () => "/screens/stats",
      providesTags: ["Screens"],
    }),

    getScreenById: builder.query<{ data: Screen }, string>({
      query: (id) => `/screens/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Screens", id }],
    }),

    createScreen: builder.mutation<
      { data: Screen & { rawDeviceSecret: string } },
      CreateScreenPayload
    >({
      query: (body) => ({
        url: "/screens",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Screens"],
    }),

    updateScreen: builder.mutation<
      { data: Screen },
      { id: string; body: Partial<CreateScreenPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/screens/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Screens"],
    }),

    deleteScreen: builder.mutation<void, string>({
      query: (id) => ({
        url: `/screens/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Screens"],
    }),
  }),
});

export const {
  useGetScreensQuery,
  useGetScreenStatsQuery,
  useGetScreenByIdQuery,
  useCreateScreenMutation,
  useUpdateScreenMutation,
  useDeleteScreenMutation,
} = screensApi;
