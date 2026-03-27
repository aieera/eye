import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  useGetPlaylistByIdQuery,
  useCreatePlaylistMutation,
  useUpdatePlaylistMutation,
  useAddPlaylistItemMutation,
  useRemovePlaylistItemMutation,
  useReorderPlaylistItemsMutation,
  usePublishPlaylistMutation,
} from "../api/playlistApi";
import { useGetLocationsQuery } from "@/modules/locations/api/locationApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { GripVertical, Trash2, Plus, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PlaylistItem } from "../types/playlists.types";
import AddItemDialog from "../components/AddItemDialog";
import PlaylistPreview from "../components/PlaylistPreview";
import PublishDialog from "../components/PublishDialog";

function SortableItem({ item, onRemove }: { item: PlaylistItem; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const getItemLabel = () => {
    if (item.itemType === "product") return item.product?.name || "Product";
    if (item.itemType === "offer") return item.offer?.name || "Offer";
    if (item.itemType === "custom") return item.customText?.slice(0, 40) || "Custom Text";
    if (item.itemType === "media") return item.mediaUrl?.split("/").pop() || "Media";
    return "Item";
  };

  const getThumb = () => {
    if (item.itemType === "product" && item.product?.imageUrl)
      return <img src={item.product.imageUrl} alt="" className="w-12 h-12 object-cover rounded" />;
    if (item.itemType === "offer" && item.offer?.imageUrl)
      return <img src={item.offer.imageUrl} alt="" className="w-12 h-12 object-cover rounded" />;
    if (item.itemType === "custom")
      return <div className="w-12 h-12 rounded" style={{ backgroundColor: item.customStyle?.bgColor || "#6B21A8" }} />;
    if (item.itemType === "media" && item.mediaUrl)
      return <img src={item.mediaUrl} alt="" className="w-12 h-12 object-cover rounded" />;
    return <div className="w-12 h-12 bg-gray-200 rounded" />;
  };

  const typeColors: Record<string, string> = {
    product: "bg-blue-100 text-blue-700",
    offer: "bg-green-100 text-green-700",
    custom: "bg-purple-100 text-purple-700",
    media: "bg-orange-100 text-orange-700",
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-card rounded-lg border border-border/60 p-3 hover:shadow-sm transition-shadow">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground">
        <GripVertical size={18} />
      </button>
      <span className="text-xs text-muted-foreground/50 w-6">#{item.displayOrder + 1}</span>
      {getThumb()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{getItemLabel()}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${typeColors[item.itemType] || "bg-muted text-muted-foreground"}`}>
            {item.itemType}
          </span>
          <span className="text-xs text-muted-foreground">{item.displayDurationSeconds}s</span>
        </div>
      </div>
      <button onClick={onRemove} className="p-1 text-muted-foreground/50 hover:text-red-500 transition-colors">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function PlaylistBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: playlistRes, refetch } = useGetPlaylistByIdQuery(id as string, { skip: !id });
  const { data: locRes } = useGetLocationsQuery({ limit: 100 });

  const [createPlaylist, { isLoading: creating }] = useCreatePlaylistMutation();
  const [updatePlaylist] = useUpdatePlaylistMutation();
  const [addItem] = useAddPlaylistItemMutation();
  const [removeItem] = useRemovePlaylistItemMutation();
  const [reorderItems] = useReorderPlaylistItemsMutation();
  const [publishPlaylist] = usePublishPlaylistMutation();

  const playlist = playlistRes?.data;
  const locations = locRes?.data ?? [];
  const items = playlist?.items ?? [];

  const [form, setForm] = useState({
    name: "", description: "", locationId: "",
    transitionType: "fade", transitionDurationMs: 500, defaultDurationSec: 5,
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    if (playlist) {
      setForm({
        name: playlist.name,
        description: playlist.description || "",
        locationId: playlist.locationId || "",
        transitionType: playlist.transitionType,
        transitionDurationMs: playlist.transitionDurationMs,
        defaultDurationSec: playlist.defaultDurationSec,
      });
    }
  }, [playlist]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = useCallback(async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    try {
      await reorderItems({
        playlistId: id,
        body: { items: reordered.map((item, idx) => ({ id: item.id, displayOrder: idx })) },
      }).unwrap();
    } catch { toast({ title: "Error reordering" }); }
  }, [items, id, reorderItems, toast]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Name is required" }); return; }

    try {
      if (id) {
        await updatePlaylist({ id, body: { ...form, locationId: form.locationId || undefined } }).unwrap();
        toast({ title: "Playlist saved" });
      } else {
        const result = await createPlaylist({ ...form, locationId: form.locationId || undefined }).unwrap();
        toast({ title: "Playlist created" });
        navigate(`/playlists/${result.data.id}`, { replace: true });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Failed to save" });
    }
  };

  const handleAddItem = async (data: any) => {
    if (!id) return;
    try {
      await addItem({ playlistId: id, body: { ...data, displayOrder: items.length } }).unwrap();
      setAddDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Failed to add item" });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!id) return;
    try {
      await removeItem({ playlistId: id, itemId }).unwrap();
    } catch { toast({ title: "Error removing item" }); }
  };

  const handlePublish = async () => {
    if (!id) return;
    try {
      const r = await publishPlaylist(id).unwrap();
      toast({ title: `Published v${r.data.playlist.version}! ${r.data.affectedScreens} screen(s) notified.` });
      setPublishDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Failed to publish" });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{id ? "Edit Playlist" : "Create Playlist"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
            Playlists / {id ? form.name || "Edit" : "New"}
            {playlist && <Badge variant="secondary" className="font-mono text-xs">v{playlist.version} — {playlist.status}</Badge>}
          </p>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-card rounded-xl border border-border/60 p-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Playlist name" />
          </div>
          <div>
            <Label>Location</Label>
            <Select value={form.locationId || "none"} onValueChange={(v) => setForm({ ...form, locationId: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="All locations" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Locations</SelectItem>
                {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Transition</Label>
            <Select value={form.transitionType} onValueChange={(v) => setForm({ ...form, transitionType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["fade", "slide", "zoom", "dissolve", "none"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Transition Duration: {form.transitionDurationMs}ms</Label>
            <Slider value={[form.transitionDurationMs]} onValueChange={([v]) => setForm({ ...form, transitionDurationMs: v })} min={0} max={3000} step={100} className="mt-2" />
          </div>
          <div>
            <Label>Default Item Duration: {form.defaultDurationSec}s</Label>
            <Slider value={[form.defaultDurationSec]} onValueChange={([v]) => setForm({ ...form, defaultDurationSec: v })} min={1} max={60} step={1} className="mt-2" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" rows={2} />
          </div>
        </div>
      </div>

      {/* Main: Items + Preview */}
      <div className="grid grid-cols-5 gap-6">
        {/* Items List (3 cols) */}
        <div className="col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Playlist Items ({items.length})</h3>
            <Button size="sm" onClick={() => setAddDialogOpen(true)} disabled={!id}>
              <Plus size={16} className="mr-1" /> Add Item
            </Button>
          </div>
          {!id && <p className="text-sm text-muted-foreground">Save the playlist first to add items.</p>}
          {id && items.length === 0 && (
            <div className="rounded-xl border border-border/60 bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No items yet. Add products, offers, or custom content.</p>
            </div>
          )}
          {id && items.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {items.map((item) => (
                    <SortableItem key={item.id} item={item} onRemove={() => handleRemoveItem(item.id)} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Preview (2 cols) */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-sm font-medium">Preview</h3>
          <PlaylistPreview
            items={items}
            transitionType={form.transitionType}
            transitionDurationMs={form.transitionDurationMs}
            isPlaying={previewPlaying}
            currentIndex={previewIndex}
            onIndexChange={setPreviewIndex}
          />
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="icon" onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))} disabled={items.length === 0}>
              <SkipBack size={16} />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setPreviewPlaying(!previewPlaying)} disabled={items.length === 0}>
              {previewPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setPreviewIndex((previewIndex + 1) % Math.max(1, items.length))} disabled={items.length === 0}>
              <SkipForward size={16} />
            </Button>
            <span className="text-xs text-muted-foreground ml-2">
              {items.length > 0 ? `Item ${previewIndex + 1} of ${items.length}` : "No items"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex justify-between items-center border-t border-border/60 pt-4">
        <div className="text-sm text-muted-foreground">
          {playlist?.updatedAt && `Last saved: ${new Date(playlist.updatedAt).toLocaleString()}`}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/playlists")}>Cancel</Button>
          <Button variant="outline" onClick={handleSave} disabled={creating}>Save Draft</Button>
          {id && (
            <Button onClick={() => setPublishDialogOpen(true)} className="bg-primary hover:bg-primary/90" disabled={items.length === 0}>
              Publish
            </Button>
          )}
        </div>
      </div>

      <AddItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddItem}
        defaultDuration={form.defaultDurationSec}
      />

      <PublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        onPublish={handlePublish}
        playlistName={form.name}
        version={(playlist?.version ?? 0) + 1}
      />
    </div>
  );
}
