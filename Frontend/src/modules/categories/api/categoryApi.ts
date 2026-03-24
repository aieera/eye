import { apiSlice } from "@/shared/api/apiSlice";
import type {
  Category,
  CategoryTreeNode,
  CreateCategoryPayload,
} from "../types/category.types";

export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<
      { data: Category[]; meta: { pagination: any } },
      { page?: number; limit?: number; search?: string; level?: string; parentId?: string } | void
    >({
      query: (params) => ({ url: "/categories", params: params || {} }),
      providesTags: ["Categories"],
    }),

    getCategoryTree: builder.query<{ data: CategoryTreeNode[] }, void>({
      query: () => "/categories/tree",
      providesTags: ["Categories"],
    }),

    getCategoryById: builder.query<{ data: Category }, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Categories", id }],
    }),

    createCategory: builder.mutation<{ data: Category }, CreateCategoryPayload>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: ["Categories"],
    }),

    updateCategory: builder.mutation<
      { data: Category },
      { id: string; body: Partial<CreateCategoryPayload> }
    >({
      query: ({ id, body }) => ({ url: `/categories/${id}`, method: "PUT", body }),
      invalidatesTags: ["Categories"],
    }),

    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryTreeQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
