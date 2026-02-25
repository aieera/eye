import { apiSlice } from "@/shared/api/apiSlice";
import type { Product } from "../types";
import type { ProductFormData } from "../schema/productSchema";

const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Wireless Headphones", description: "Noise-cancelling over-ear headphones", price: 299.99, category: "Electronics", sku: "WH-001", stock: 45, status: "active", createdAt: "2025-01-15T00:00:00Z", updatedAt: "2025-01-15T00:00:00Z" },
  { id: "2", name: "Mechanical Keyboard", description: "RGB backlit mechanical keyboard", price: 149.99, category: "Electronics", sku: "MK-002", stock: 120, status: "active", createdAt: "2025-02-01T00:00:00Z", updatedAt: "2025-02-01T00:00:00Z" },
  { id: "3", name: "Desk Lamp", description: "Adjustable LED desk lamp", price: 59.99, category: "Office", sku: "DL-003", stock: 0, status: "draft", createdAt: "2025-02-10T00:00:00Z", updatedAt: "2025-02-10T00:00:00Z" },
  { id: "4", name: "Ergonomic Chair", description: "Lumbar support office chair", price: 499.99, category: "Furniture", sku: "EC-004", stock: 15, status: "active", createdAt: "2025-03-01T00:00:00Z", updatedAt: "2025-03-01T00:00:00Z" },
];

let products = [...MOCK_PRODUCTS];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      queryFn: async () => {
        await delay(500);
        return { data: [...products] };
      },
      providesTags: ["Product"],
    }),
    getProduct: builder.query<Product, string>({
      queryFn: async (id) => {
        await delay(300);
        const product = products.find((p) => p.id === id);
        if (!product) return { error: { status: 404, data: "Not found" } };
        return { data: product };
      },
      providesTags: ["Product"],
    }),
    createProduct: builder.mutation<Product, ProductFormData>({
      queryFn: async (body) => {
        await delay(600);
        const newProduct: Product = {
          ...body,
          id: String(Date.now()),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        products.push(newProduct);
        return { data: newProduct };
      },
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<Product, { id: string; data: ProductFormData }>({
      queryFn: async ({ id, data: body }) => {
        await delay(600);
        const idx = products.findIndex((p) => p.id === id);
        if (idx === -1) return { error: { status: 404, data: "Not found" } };
        products[idx] = { ...products[idx], ...body, updatedAt: new Date().toISOString() };
        return { data: products[idx] };
      },
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay(400);
        products = products.filter((p) => p.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
