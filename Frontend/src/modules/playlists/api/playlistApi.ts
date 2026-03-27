import { apiSlice } from "@/shared/api/apiSlice";
import { Playlist } from "../types/playlists.types";

export const playlistApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET ALL
    getPlaylists: builder.query<Playlist[], void>({
      query: () => "/playlists",
      providesTags: ["Playlists"],
    }),

    // GET BY ID
    getPlaylistById: builder.query<Playlist, string>({
      query: (id) => `/playlists/${id}`,
      providesTags: ["Playlists"],
    }),

    // CREATE
    createPlaylist: builder.mutation({
      query: (body) => ({
        url: "/playlists",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Playlists"],
    }),

    // UPDATE
    updatePlaylist: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/playlists/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Playlists"],
    }),

    // DELETE
    deletePlaylist: builder.mutation({
      query: (id) => ({
        url: `/playlists/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Playlists", id },
        { type: "Playlists", id: "LIST" },
      ],
    }),

  }),
});

export const {
  useGetPlaylistsQuery,
  useGetPlaylistByIdQuery,
  useCreatePlaylistMutation,
  useUpdatePlaylistMutation,
  useDeletePlaylistMutation,
} = playlistApi;