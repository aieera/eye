
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useDeletePlaylistMutation } from "../api/playlistApi";

export default function PlaylistTable({ playlists }) {

  const [deletePlaylist] = useDeletePlaylistMutation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;

    try {
      await deletePlaylist(id).unwrap();
      toast({ title: "Playlist deleted" });
    } catch {
      toast({ title: "Error deleting playlist" });
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border">

      <table className="w-full text-md">

        <thead className="bg-gray-200">
          <tr className="text-left">
            <th className="px-4 py-3"></th>
            <th className="px-6 py-3 font-normal">Playlist Name</th>
            <th className="px-6 py-3 font-normal">Products</th>
            <th className="px-6 py-3 font-normal">Created Date</th>
            <th className="px-6 py-3 font-normal">Action</th>
          </tr>
        </thead>

        <tbody className="text-gray-700">
          {playlists.map((playlist) => (
            <tr
              key={playlist.id}
              className="border-t border-gray-200 hover:bg-gray-50"
            >
              <td className="px-4 py-4">
                <input type="checkbox" />
              </td>

              <td className="px-6 py-4">{playlist.name}</td>

              <td className="px-6 py-4">
                {playlist.products?.length || 0} items
              </td>

              <td className="px-6 py-4">{playlist.createdAt}</td>

              <td className="px-6 py-4 flex gap-3">
                <button
                  onClick={() => navigate(`/playlists/${playlist.id}`)}
                  className="hover:text-purple-700"
                >
                  ✏️
                </button>

                <button
                  onClick={() => handleDelete(playlist.id)}
                  className="hover:text-red-500"
                >
                  🗑
                </button>
              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}