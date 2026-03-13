import { apiSlice } from "@/shared/api/apiSlice";
import { Screen } from "../types/screens.types";


export const screensApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getScreens: builder.query<Screen[], void>({
      query: () => "/screens",
      providesTags: ["Screens"],
    }),

    getScreenById: builder.query<Screen, string>({
      query: (id) => `/screens/${id}`,
    }),

    createScreen: builder.mutation({
      query: (body) => ({
        url: "/screens",
        method: "POST",
        body
      })
    }),

    updateScreen: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/screens/${id}`,
        method: "PUT",
        body
      })
    }),

    deleteScreen: builder.mutation({
      query: (id) => ({
        url: `/screens/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Screens"]
    })

  }),
});

export const {
  useGetScreensQuery,
  useGetScreenByIdQuery,
  useCreateScreenMutation,
  useUpdateScreenMutation,
  useDeleteScreenMutation

} = screensApi;