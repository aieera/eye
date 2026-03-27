import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PlaylistGrid({ playlists }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-6">

      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition"
        >

          {/* IMAGE (placeholder) */}
          <div className="relative">
            <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
              Playlist Preview
            </div>

            <button
              onClick={() => navigate(`/playlists/${playlist.id}`)}
              className="absolute top-3 right-3 bg-white rounded-full p-1 shadow hover:bg-gray-100"
            >
              <Eye size={16} />
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-4">

            <p className="font-semibold text-sm">
              {playlist.name}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {playlist.products?.length || 0} products
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Created: {playlist.createdAt}
            </p>

          </div>

        </div>
      ))}

    </div>
  );
}