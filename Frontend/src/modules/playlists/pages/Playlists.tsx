import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ListVideo, Copy } from "lucide-react";
import {
  useGetPlaylistsQuery,
  useDeletePlaylistMutation,
  useDuplicatePlaylistMutation,
  usePublishPlaylistMutation,
} from "../api/playlistApi";
import { useGetLocationsQuery } from "@/modules/locations/api/locationApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, locationFilter]);

  const { data: res, isLoading } = useGetPlaylistsQuery({
    page, limit: 20,
    search: debouncedSearch || undefined,
    status: statusFilter as any,
    locationId: locationFilter,
  });
  const { data: locRes } = useGetLocationsQuery({ limit: 100 });

  const playlists = res?.data ?? [];
  const pagination = res?.meta?.pagination;
  const locations = locRes?.data ?? [];

  const handleDuplicate = async (id: string) => {
    try {
      await duplicatePlaylist(id).unwrap();
      toast({ title: "Playlist duplicated" });
    } catch { toast({ title: "Error duplicating playlist" }); }
  };

  const handlePublish = async (id: string) => {
    try {
      const r = await publishPlaylist(id).unwrap();
      toast({ title: `Published! ${r.data.affectedScreens} screen(s) notified.` });
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Failed to publish" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePlaylist(deleteTarget).unwrap();
      toast({ title: "Playlist deleted" });
    } catch { toast({ title: "Error deleting playlist" }); }
    setDeleteTarget(null);
  };

  return (
    <div className="p-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Playlists</h1>
          <p className="text-sm text-gray-500 mt-1">Build and manage content playlists</p>
        </div>
        <Button onClick={() => navigate("/playlists/new")} className="bg-purple-900 hover:bg-purple-800">
          <Plus size={18} className="mr-2" /> Create Playlist
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow border w-72">
          <Search size={18} className="text-gray-400 mr-3" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search playlists..." className="border-0 shadow-none p-0 h-auto focus-visible:ring-0" />
        </div>
        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-36 bg-white shadow border"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <Select value={locationFilter || "all"} onValueChange={(v) => setLocationFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-48 bg-white shadow border"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border p-12 text-center"><p className="text-gray-500">Loading...</p></div>
      ) : playlists.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <ListVideo size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No playlists found</p>
          <p className="text-sm text-gray-400 mt-1">Create your first playlist to get started</p>
          <Button onClick={() => navigate("/playlists/new")} className="mt-4 bg-purple-900 hover:bg-purple-800">Create Playlist</Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden border">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr className="text-left text-sm">
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Items</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Version</th>
                <th className="px-4 py-3 font-normal">Transition</th>
                <th className="px-4 py-3 font-normal">Location</th>
                <th className="px-4 py-3 font-normal">Published</th>
                <th className="px-4 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {playlists.map((p: Playlist) => (
                <tr key={p.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/playlists/${p.id}`)}>
                  <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-sm">{p._count?.items ?? 0}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === "published" ? "default" : "secondary"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">v{p.version}</td>
                  <td className="px-4 py-3 text-sm capitalize">{p.transitionType}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.location?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">...</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => navigate(`/playlists/${p.id}`)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(p.id)}>
                          <Copy size={14} className="mr-2" /> Duplicate
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
