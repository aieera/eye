import { apiSlice } from "@/shared/api/apiSlice";
import type {
  Schedule,
  SchedulesListParams,
  CreateSchedulePayload,
  CalendarDay,
} from "../types/schedule.types";

export const scheduleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSchedules: builder.query<
      { data: Schedule[]; meta: { pagination: any } },
      SchedulesListParams | void
    >({
      query: (params) => ({ url: "/schedules", params: params || {} }),
      providesTags: ["Schedules"],
    }),

    getScheduleById: builder.query<{ data: Schedule }, string>({
      query: (id) => `/schedules/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Schedules", id }],
    }),

    createSchedule: builder.mutation<
      { data: { schedule: Schedule; conflicts: any } },
      CreateSchedulePayload
    >({
      query: (body) => ({ url: "/schedules", method: "POST", body }),
      invalidatesTags: ["Schedules"],
    }),

    updateSchedule: builder.mutation<
      { data: { schedule: Schedule; conflicts: any } },
      { id: string; body: Partial<CreateSchedulePayload> & { isActive?: boolean } }
    >({
      query: ({ id, body }) => ({ url: `/schedules/${id}`, method: "PUT", body }),
      invalidatesTags: ["Schedules"],
    }),

    deleteSchedule: builder.mutation<void, string>({
      query: (id) => ({ url: `/schedules/${id}`, method: "DELETE" }),
      invalidatesTags: ["Schedules"],
    }),

    getScreenSchedules: builder.query<
      { data: Schedule[] },
      { screenId: string; dateFrom?: string; dateTo?: string }
    >({
      query: ({ screenId, ...params }) => ({
        url: `/schedules/screen/${screenId}`,
        params,
      }),
      providesTags: ["Schedules"],
    }),

    getActiveSchedule: builder.query<{ data: Schedule | null }, string>({
      query: (screenId) => `/schedules/screen/${screenId}/active`,
      providesTags: ["Schedules"],
    }),

    getScheduleCalendar: builder.query<
      { data: CalendarDay[] },
      { screenId: string; month: number; year: number }
    >({
      query: ({ screenId, month, year }) => ({
        url: `/schedules/screen/${screenId}/calendar`,
        params: { month, year },
      }),
      providesTags: ["Schedules"],
    }),
  }),
});

export const {
  useGetSchedulesQuery,
  useGetScheduleByIdQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useGetScreenSchedulesQuery,
  useGetActiveScheduleQuery,
  useGetScheduleCalendarQuery,
} = scheduleApi;
