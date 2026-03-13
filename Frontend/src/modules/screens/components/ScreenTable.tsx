import { useState } from "react";
import ScreenStatusBadge from "./ScreenStatusBadge";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useDeleteScreenMutation } from "../api/screens.api";

export default function ScreenTable({ screens }) {

  const [copiedId, setCopiedId] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate()

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);

    setCopiedId(id);

    toast({
      title: "Screen code copied",
      className: "border-green-200 bg-gray-50 shadow",
    });

    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };
  const [deleteScreen] = useDeleteScreenMutation();

  const handleDelete = async (id) => {

  if (!confirm("Are you sure you want to delete this screen?")) return;

  try {
    await deleteScreen(id).unwrap();

    toast({
      title: "Screen deleted",
    });

  } catch {
    toast({
      title: "Error deleting screen",
    });
  }

};

  return (
    <div className="bg-white rounded-xl overflow-hidden border">

      <table className="w-full text-md">

        <thead className="bg-gray-200">
          <tr className="text-left">

            <th className="px-4 py-3"></th>
            <th className="px-6 py-3 font-normal">Screen name</th>
            <th className="px-6 py-3 font-normal">Location</th>
            <th className="px-6 py-3 font-normal">Screen code</th>
            <th className="px-6 py-3 font-normal">Status</th>
            <th className="px-6 py-3 font-normal">Created Date & time</th>
            <th className="px-6 py-3 font-normal">Last sync</th>
            <th className="px-6 py-3 font-normal">Action</th>

          </tr>
        </thead>

        <tbody className="text-gray-700">

          {screens.map((screen) => (
            <tr
              key={screen.id}
              className="border-t border-gray-200 hover:bg-gray-50"
            >

              <td className="px-4 py-4">
                <input type="checkbox" />
              </td>

              <td className="px-6 py-4">{screen.screenName}</td>

              <td className="px-6 py-4">{screen.location}</td>

              <td className="px-6 py-4 flex items-center gap-2">

                {screen.screenCode}

                <button
                  onClick={() => copyToClipboard(screen.screenCode, screen.id)}
                  className="text-gray-400 shadow hover:text-black"
                >
                  {copiedId === screen.id ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>

              </td>

              <td className="px-6 py-4">
                <ScreenStatusBadge status={screen.status} />
              </td>

              <td className="px-6 py-4">{screen.createdAt}</td>

              <td className="px-6 py-4">{screen.lastSync}</td>

              <td className="px-6 py-4 flex gap-3">
                <button onClick={()=>navigate(`/screens/${screen.id}`)} className="hover:text-purple-700">✏️</button>
                <button  onClick={() => handleDelete(screen.id)} className="hover:text-red-500">🗑</button>
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}