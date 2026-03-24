import { apiSlice } from "@/shared/api/apiSlice";
import type {
  Playlist,
  PlaylistItem,
  PlaylistsListParams,
  CreatePlaylistPayload,
  AddPlaylistItemPayload,
  ReorderPayload,
} from "../types/playlists.types";

export const playlistApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlaylists: builder.query<
      { data: Playlist[]; meta: { pagination: any } },
      PlaylistsListParams | void
    >({
      query: (params) => ({ url: "/playlists", params: params || {} }),
      providesTags: ["Playlists"],
    }),

    getPlaylistById: builder.query<{ data: Playlist }, string>({
      query: (id) => `/playlists/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Playlists", id }],
    }),

    createPlaylist: builder.mutation<{ data: Playlist }, CreatePlaylistPayload>({
      query: (body) => ({ url: "/playlists", method: "POST", body }),
      invalidatesTags: ["Playlists"],
    }),

    updatePlaylist: builder.mutation<
      { data: Playlist },
      { id: string; body: Partial<CreatePlaylistPayload> }
    >({
      query: ({ id, body }) => ({ url: `/playlists/${id}`, method: "PUT", body }),
      invalidatesTags: ["Playlists"],
    }),

    deletePlaylist: builder.mutation<void, string>({
      query: (id) => ({ url: `/playlists/${id}`, method: "DELETE" }),
      invalidatesTags: ["Playlists"],
    }),

    addPlaylistItem: builder.mutation<
      { data: PlaylistItem },
      { playlistId: string; body: AddPlaylistItemPayload }
    >({
      query: ({ playlistId, body }) => ({
        url: `/playlists/${playlistId}/items`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Playlists"],
    }),

    updatePlaylistItem: builder.mutation<
      { data: PlaylistItem },
      { playlistId: string; itemId: string; body: any }
    >({
      query: ({ playlistId, itemId, body }) => ({
        url: `/playlists/${playlistId}/items/${itemId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Playlists"],
    }),

    removePlaylistItem: builder.mutation<void, { playlistId: string; itemId: string }>({
      query: ({ playlistId, itemId }) => ({
        url: `/playlists/${playlistId}/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Playlists"],
    }),

    reorderPlaylistItems: builder.mutation<
      { data: PlaylistItem[] },
      { playlistId: string; body: ReorderPayload }
    >({
      query: ({ playlistId, body }) => ({
        url: `/playlists/${playlistId}/items/reorder`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Playlists"],
    }),

    publishPlaylist: builder.mutation<
      { data: { playlist: Playlist; affectedScreens: number } },
      string
    >({
      query: (id) => ({ url: `/playlists/${id}/publish`, method: "POST" }),
      invalidatesTags: ["Playlists"],
    }),

    duplicatePlaylist: builder.mutation<{ data: Playlist }, string>({
      query: (id) => ({ url: `/playlists/${id}/duplicate`, method: "POST" }),
      invalidatesTags: ["Playlists"],
    }),
  }),
});

export const {
  useGetPlaylistsQuery,
  useGetPlaylistByIdQuery,
  useCreatePlaylistMutation,
  useUpdatePlaylistMutation,
  useDeletePlaylistMutation,
  useAddPlaylistItemMutation,
  useUpdatePlaylistItemMutation,
  useRemovePlaylistItemMutation,
  useReorderPlaylistItemsMutation,
  usePublishPlaylistMutation,
  useDuplicatePlaylistMutation,
} = playlistApi;
