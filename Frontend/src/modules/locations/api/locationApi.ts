import { apiSlice } from "@/shared/api/apiSlice";

export interface Location {
  id: string;
  name: string;
  oracleLocationId?: string;
  address?: string;
  timezone: string;
  isActive: boolean;
  _count?: { screens: number };
}

export const locationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLocations: builder.query<
      { data: Location[]; meta: { pagination: any } },
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => ({ url: "/locations", params: params || {} }),
      providesTags: ["Locations"],
    }),

    getLocationById: builder.query<{ data: Location }, string>({
      query: (id) => `/locations/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Locations", id }],
    }),

    createLocation: builder.mutation({
      query: (body) => ({ url: "/locations", method: "POST", body }),
      invalidatesTags: ["Locations"],
    }),

    updateLocation: builder.mutation({
      query: ({ id, body }: { id: string; body: any }) => ({
        url: `/locations/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Locations"],
    }),

    deleteLocation: builder.mutation({
      query: (id: string) => ({ url: `/locations/${id}`, method: "DELETE" }),
      invalidatesTags: ["Locations"],
    }),
  }),
});

export const {
  useGetLocationsQuery,
  useGetLocationByIdQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} = locationApi;
