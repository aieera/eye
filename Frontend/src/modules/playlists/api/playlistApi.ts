import { apiSlice } from "@/shared/api/apiSlice";
import { Playlist } from "../types/playlists.types";

export const playlistApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getPlaylists: builder.query<Playlist[], void>({
      query: () => "/playlists",
      providesTags: ["Playlists"],
    }),

    getPlaylistById: builder.query<Playlist, string>({
      query: (id) => `/playlists/${id}`,
      providesTags: ["Playlists"],
    }),

  }),
});

export const {
  useGetPlaylistsQuery,
  useGetPlaylistByIdQuery
} = playlistApi;