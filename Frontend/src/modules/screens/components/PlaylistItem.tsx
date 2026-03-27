export default function PlaylistItem({
  playlist,
  selectedPlaylists,
  togglePlaylist,
  expandedPlaylist,
  setExpandedPlaylist,
}: any) {

  const checked = selectedPlaylists.some(p => p.id === playlist.id);

  return (
    <div className="border-b pb-3">

      <div className="flex justify-between items-center">

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => togglePlaylist(playlist)}
          />

          <div>
            <p className="text-sm">{playlist.name}</p>
            <p className="text-xs text-gray-500">
              Products counts : {playlist.products.length}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setExpandedPlaylist(
              expandedPlaylist?.id === playlist.id ? null : playlist
            )
          }
        >
          {expandedPlaylist?.id === playlist.id ? "▲" : "▼"}
        </button>

      </div>

    </div>
  );
}