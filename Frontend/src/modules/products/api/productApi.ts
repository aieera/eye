import { apiSlice } from "@/shared/api/apiSlice";

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getProducts: builder.query<any[], void>({
      query: () => "/products",
      providesTags: ["Products"],
    }),

    getProductById: builder.query<any, string>({
      query: (id) => `/products/${id}`,
      providesTags: ["Products"],
    }),

  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
} = productApi;