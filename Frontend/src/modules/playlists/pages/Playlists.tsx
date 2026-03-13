import React from "react";
import { useGetPlaylistsQuery } from "../api/playlistApi";
import { Playlist } from "../types/playlists.types";

function Playlists() {

  const { data: playlists = [], isLoading, error } = useGetPlaylistsQuery();

  if (isLoading) return <p>Loading playlists...</p>;
  if (error) return <p>Failed to load playlists</p>;

  return (
    <div>
      <h2>Playlists</h2>

      {playlists.map((playlist: Playlist) => (
        <div
          key={playlist.id}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px"
          }}
        >
          <h4>{playlist.name}</h4>
          <p>Playlist Code: {playlist.playlistId}</p>
          <p>Products Count: {playlist.products.length}</p>
          <p>Created: {playlist.createdAt}</p>
        </div>
      ))}

    </div>
  );
}

export default Playlists;