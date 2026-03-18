import { apiSlice } from "@/shared/api/apiSlice";
import { Brand } from "../types/brand.types";

export const brandsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getBrands: builder.query<Brand[], void>({
      query: () => "/brands",
      providesTags: ["Brands"],
    }),

    deleteBrand: builder.mutation({
      query: (id) => ({
        url: `/brands/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Brands"]
    })

  }),
});

export const {
  useGetBrandsQuery,
  useDeleteBrandMutation
} = brandsApi;