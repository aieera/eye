import { useState } from "react";
import { Copy, Check, Pencil, Trash2, Monitor } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useDeleteScreenMutation } from "../api/screens.api";
import ScreenStatusBadge from "./ScreenStatusBadge";
import type { Screen } from "../types/screens.types";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
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
    toast({ title: "Screen code copied" });
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteScreen(id).unwrap();
      toast({ title: "Screen deleted" });
    } catch {
      toast({ title: "Error deleting screen", variant: "destructive" });
    }
  };

  if (screens.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
          <Monitor className="w-6 h-6 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No screens found</p>
        <p className="text-xs text-muted-foreground">Create your first screen to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Screen</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Seen</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40 bg-card">
          {screens.map((screen) => (
            <tr key={screen.id} className="hover:bg-muted/20 transition-colors group">
              <td className="px-4 py-3.5">
                <p className="text-sm font-medium text-foreground">{screen.screenName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs font-mono text-muted-foreground">{screen.screenCode}</p>
                  <button
                    onClick={() => copyToClipboard(screen.screenCode, screen.id)}
                    className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    {copiedId === screen.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                  {screen.location?.name ?? "—"}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <ScreenStatusBadge status={screen.status} />
              </td>
              <td className="px-4 py-3.5 text-sm text-muted-foreground">
                {screen.lastHeartbeat
                  ? formatDistanceToNow(new Date(screen.lastHeartbeat), { addSuffix: true })
                  : "Never"}
              </td>
              <td className="px-4 py-3.5 text-sm text-muted-foreground">
                {new Date(screen.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </td>
              <td className="px-4 py-3.5">
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => navigate(`/screens/${screen.id}`)}
                    className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
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
                        <AlertDialogAction onClick={() => handleDelete(screen.id)}>Delete</AlertDialogAction>
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
