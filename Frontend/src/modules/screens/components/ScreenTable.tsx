import { useState } from "react";
import ScreenStatusBadge from "./ScreenStatusBadge";
import { Copy, Check, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useDeleteScreenMutation } from "../api/screens.api";
import type { Screen } from "../types/screens.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  screens: Screen[];
}

export default function ScreenTable({ screens }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteScreen] = useDeleteScreenMutation();

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast({ title: "Screen code copied", className: "border-green-200 bg-gray-50 shadow" });
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteScreen(id).unwrap();
      toast({ title: "Screen deleted" });
    } catch {
      toast({ title: "Error deleting screen" });
    }
  };

  if (screens.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center">
        <p className="text-gray-500">No screens found</p>
        <p className="text-sm text-gray-400 mt-1">Create your first screen to get started</p>
      </div>
    );
  }

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
            <th className="px-6 py-3 font-normal">Created</th>
            <th className="px-6 py-3 font-normal">Last heartbeat</th>
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
              <td className="px-6 py-4">{screen.location?.name ?? "—"}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{screen.screenCode}</span>
                  <button
                    onClick={() => copyToClipboard(screen.screenCode, screen.id)}
                    className="text-gray-400 hover:text-black"
                  >
                    {copiedId === screen.id ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4">
                <ScreenStatusBadge status={screen.status} />
              </td>
              <td className="px-6 py-4 text-sm">
                {new Date(screen.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm">
                {screen.lastHeartbeat
                  ? new Date(screen.lastHeartbeat).toLocaleString()
                  : "Never"}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/screens/${screen.id}`)}
                    className="p-1 hover:text-purple-700"
                  >
                    <Pencil size={16} />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="p-1 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete screen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will deactivate "{screen.screenName}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(screen.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
