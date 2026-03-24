import { apiSlice } from "@/shared/api/apiSlice";
import type {
  IngestionConnection,
  IngestionFieldMapping,
  IngestionLog,
  CreateConnectionPayload,
  TestConnectionPayload,
  SyncStatus,
  FieldMappingResponse,
} from "../types/ingestion.types";

export const ingestionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConnections: builder.query<{ data: IngestionConnection[] }, void>({
      query: () => "/ingestion/connections",
      providesTags: ["Ingestion"],
    }),

    getConnection: builder.query<{ data: IngestionConnection }, string>({
      query: (id) => `/ingestion/connections/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Ingestion", id }],
    }),

    createConnection: builder.mutation<{ data: IngestionConnection }, CreateConnectionPayload>({
      query: (body) => ({ url: "/ingestion/connections", method: "POST", body }),
      invalidatesTags: ["Ingestion"],
    }),

    updateConnection: builder.mutation<
      { data: IngestionConnection },
      { id: string; body: Partial<CreateConnectionPayload> & { isActive?: boolean } }
    >({
      query: ({ id, body }) => ({ url: `/ingestion/connections/${id}`, method: "PUT", body }),
      invalidatesTags: ["Ingestion"],
    }),

    deleteConnection: builder.mutation<void, string>({
      query: (id) => ({ url: `/ingestion/connections/${id}`, method: "DELETE" }),
      invalidatesTags: ["Ingestion"],
    }),

    testConnectionUnsaved: builder.mutation<
      { data: { success: boolean; serverInfo?: string; error?: string } },
      TestConnectionPayload
    >({
      query: (body) => ({ url: "/ingestion/connections/test", method: "POST", body }),
    }),

    testSavedConnection: builder.mutation<
      { data: { success: boolean; serverInfo?: string; error?: string } },
      string
    >({
      query: (id) => ({ url: `/ingestion/connections/${id}/test`, method: "POST" }),
      invalidatesTags: ["Ingestion"],
    }),

    getFieldMappings: builder.query<{ data: FieldMappingResponse }, string>({
      query: (id) => `/ingestion/connections/${id}/mappings`,
      providesTags: ["Ingestion"],
    }),

    createFieldMapping: builder.mutation<
      { data: IngestionFieldMapping },
      { connectionId: string; body: { entityType: string; externalField: string; internalField: string; transformRule?: string; isRequired?: boolean } }
    >({
      query: ({ connectionId, body }) => ({
        url: `/ingestion/connections/${connectionId}/mappings`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Ingestion"],
    }),

    updateFieldMapping: builder.mutation<
      { data: IngestionFieldMapping },
      { mappingId: string; body: any }
    >({
      query: ({ mappingId, body }) => ({
        url: `/ingestion/mappings/${mappingId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Ingestion"],
    }),

    deleteFieldMapping: builder.mutation<void, string>({
      query: (mappingId) => ({ url: `/ingestion/mappings/${mappingId}`, method: "DELETE" }),
      invalidatesTags: ["Ingestion"],
    }),

    triggerSync: builder.mutation<
      { data: { queued: boolean; syncType: string } },
      { connectionId: string; syncType: "full" | "incremental" | "price-only" }
    >({
      query: ({ connectionId, syncType }) => ({
        url: `/ingestion/connections/${connectionId}/sync`,
        method: "POST",
        body: { syncType },
      }),
      invalidatesTags: ["Ingestion"],
    }),

    getSyncLogs: builder.query<
      { data: IngestionLog[]; meta: { pagination: any } },
      { connectionId: string; page?: number; limit?: number; status?: string; syncType?: string }
    >({
      query: ({ connectionId, ...params }) => ({
        url: `/ingestion/connections/${connectionId}/logs`,
        params,
      }),
      providesTags: ["Ingestion"],
    }),

    getSyncStatus: builder.query<{ data: SyncStatus }, string>({
      query: (connectionId) => `/ingestion/connections/${connectionId}/status`,
      providesTags: ["Ingestion"],
    }),
  }),
});

export const {
  useGetConnectionsQuery,
  useGetConnectionQuery,
  useCreateConnectionMutation,
  useUpdateConnectionMutation,
  useDeleteConnectionMutation,
  useTestConnectionUnsavedMutation,
  useTestSavedConnectionMutation,
  useGetFieldMappingsQuery,
  useCreateFieldMappingMutation,
  useUpdateFieldMappingMutation,
  useDeleteFieldMappingMutation,
  useTriggerSyncMutation,
  useGetSyncLogsQuery,
  useGetSyncStatusQuery,
} = ingestionApi;
