import { apiSlice } from "@/shared/api/apiSlice";
import type {
  Product,
  ProductsListParams,
  CreateProductPayload,
  UpdatePricesPayload,
} from "../types/product.types";

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<
      { data: Product[]; meta: { pagination: any } },
      ProductsListParams | void
    >({
      query: (params) => ({ url: "/products", params: params || {} }),
      providesTags: ["Products"],
    }),

    getProductById: builder.query<{ data: Product }, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Products", id }],
    }),

    getProductsWithoutImages: builder.query<
      { data: Product[]; meta: { pagination: any } },
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: "/products/without-images", params: params || {} }),
      providesTags: ["Products"],
    }),

    createProduct: builder.mutation<{ data: Product }, CreateProductPayload>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: ["Products"],
    }),

    updateProduct: builder.mutation<
      { data: Product },
      { id: string; body: Partial<CreateProductPayload> }
    >({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: "PUT", body }),
      invalidatesTags: ["Products"],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Products"],
    }),

    updateProductImage: builder.mutation<
      { data: Product },
      { id: string; imageUrl: string }
    >({
      query: ({ id, imageUrl }) => ({
        url: `/products/${id}/image`,
        method: "PUT",
        body: { imageUrl },
      }),
      invalidatesTags: ["Products"],
    }),

    removeProductImage: builder.mutation<{ data: Product }, string>({
      query: (id) => ({ url: `/products/${id}/image`, method: "DELETE" }),
      invalidatesTags: ["Products"],
    }),

    updateProductPrices: builder.mutation<
      { data: any },
      { id: string; body: UpdatePricesPayload }
    >({
      query: ({ id, body }) => ({
        url: `/products/${id}/prices`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Products"],
    }),

    bulkCreateProducts: builder.mutation<
      { data: { created: number; updated: number; failed: number } },
      { products: CreateProductPayload[] }
    >({
      query: (body) => ({ url: "/products/bulk", method: "POST", body }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductsWithoutImagesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateProductImageMutation,
  useRemoveProductImageMutation,
  useUpdateProductPricesMutation,
  useBulkCreateProductsMutation,
} = productApi;
