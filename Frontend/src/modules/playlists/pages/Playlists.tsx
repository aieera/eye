import { useState, useEffect } from "react";
import { useGetPlaylistsQuery } from "../api/playlistApi";
import PlaylistToolbar from "../components/PlaylistToolbar";
import PlaylistGrid from "../components/PlaylistGrid";
import Pagination from "@/shared/components/Pagination";
import PlaylistTable from "../components/PlaylistTable";


export default function PlaylistsPage() {

  const { data: playlists = [], isLoading } = useGetPlaylistsQuery();

  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.name?.toLowerCase().includes(search.toLowerCase())
  );

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredPlaylists.length / itemsPerPage);

  const start = (page - 1) * itemsPerPage;
  const paginatedPlaylists = filteredPlaylists.slice(start, start + itemsPerPage);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filteredPlaylists, page, totalPages]);

  return (
    <div className="p-1 space-y-6">

      <div>
        <h1 className="text-3xl font-semibold">Playlists</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your playlists and assigned products
        </p>
      </div>

      <PlaylistToolbar
        view={view}
        setView={setView}
        search={search}
        setSearch={setSearch}
      />

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading playlists...</p>
      ) : (
        <>
          {view === "list" ? (
            <PlaylistTable playlists={paginatedPlaylists} />
          ) : (
            <PlaylistGrid playlists={paginatedPlaylists} />
          )}

          {paginatedPlaylists.length === 0 && (
            <p className="text-gray-400 text-sm text-center">
              No playlists found
            </p>
          )}
        </>
      )}

      {totalPages > 1 && (
        <Pagination
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      )}

    </div>
  );
}