import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ListVideo, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetPlaylistsQuery, useDeletePlaylistMutation,
  useDuplicatePlaylistMutation, usePublishPlaylistMutation,
} from "../api/playlistApi";
import { useGetLocationsQuery } from "@/modules/locations/api/locationApi";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/modules/screens/components/Pagination";
import { useToast } from "@/hooks/use-toast";
import type { Playlist } from "../types/playlists.types";

export default function Playlists() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [locationFilter, setLocationFilter] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [deletePlaylist] = useDeletePlaylistMutation();
  const [duplicatePlaylist] = useDuplicatePlaylistMutation();
  const [publishPlaylist] = usePublishPlaylistMutation();

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 300); return () => clearTimeout(t); }, [search]);
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, locationFilter]);

  const { data: res, isLoading } = useGetPlaylistsQuery({ page, limit: 20, search: debouncedSearch || undefined, status: statusFilter as any, locationId: locationFilter });
  const { data: locRes } = useGetLocationsQuery({ limit: 100 });

  const playlists = res?.data ?? [];
  const pagination = res?.meta?.pagination;
  const locations = locRes?.data ?? [];

  const handleDuplicate = async (id: string) => {
    try { await duplicatePlaylist(id).unwrap(); toast({ title: "Playlist duplicated" }); }
    catch { toast({ title: "Error duplicating playlist", variant: "destructive" }); }
  };

  const handlePublish = async (id: string) => {
    try { const r = await publishPlaylist(id).unwrap(); toast({ title: `Published! ${r.data.affectedScreens} screen(s) notified.` }); }
    catch (err: any) { toast({ title: "Error", description: err?.data?.message || "Failed to publish", variant: "destructive" }); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deletePlaylist(deleteTarget).unwrap(); toast({ title: "Playlist deleted" }); }
    catch { toast({ title: "Error deleting playlist", variant: "destructive" }); }
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Playlists</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Build and manage content playlists</p>
        </div>
        <button onClick={() => navigate("/playlists/new")} className="h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Playlist
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search playlists..."
            className="h-9 rounded-lg border border-border bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors w-64" />
        </div>
        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-36 h-9 text-sm bg-card"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <Select value={locationFilter || "all"} onValueChange={(v) => setLocationFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-48 h-9 text-sm bg-card"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
          {[...Array(5)].map((_, i) => <div key={i} className="px-4 py-3.5 border-b border-border/40"><Skeleton className="h-4 w-full" /></div>)}
        </div>
      ) : playlists.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
            <ListVideo className="w-6 h-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No playlists found</p>
          <p className="text-xs text-muted-foreground mb-4">Create your first playlist to display content</p>
          <button onClick={() => navigate("/playlists/new")} className="h-8 rounded-lg border border-border bg-card text-sm px-3 hover:bg-muted/50 transition-colors">Create Playlist</button>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr>
                {["Name", "Items", "Status", "Version", "Transition", "Location", "Published", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 bg-card">
              {playlists.map((p: Playlist) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate(`/playlists/${p.id}`)}>
                  <td className="px-4 py-3.5 text-sm font-medium">{p.name}</td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">{p._count?.items ?? 0}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-md", p.status === "published" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200")}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-muted-foreground">v{p.version}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground capitalize">{p.transitionType}</td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">{p.location?.name ?? "—"}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">···</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/playlists/${p.id}`)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(p.id)}>
                          <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePublish(p.id)}>Publish</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(p.id)} className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete playlist?</AlertDialogTitle>
            <AlertDialogDescription>This will deactivate the playlist and remove it from schedules.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
