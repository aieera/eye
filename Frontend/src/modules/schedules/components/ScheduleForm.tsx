import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useGetScreensQuery } from "@/modules/screens/api/screens.api";
import { useGetPlaylistsQuery } from "@/modules/playlists/api/playlistApi";
import { useCreateScheduleMutation, useUpdateScheduleMutation } from "../api/scheduleApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import type { Schedule } from "../types/schedule.types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editSchedule?: Schedule | null;
  defaultScreenId?: string;
}

export default function ScheduleForm({ open, onOpenChange, editSchedule, defaultScreenId }: Props) {
  const { toast } = useToast();
  const { data: screensRes } = useGetScreensQuery({ limit: 100 });
  const { data: playlistsRes } = useGetPlaylistsQuery({ limit: 100 });
  const [createSchedule] = useCreateScheduleMutation();
  const [updateSchedule] = useUpdateScheduleMutation();

  const screens = screensRes?.data ?? [];
  const playlists = playlistsRes?.data ?? [];

  const [form, setForm] = useState({
    screenId: defaultScreenId || "",
    playlistId: "",
    startDate: "",
    endDate: "",
    noEndDate: true,
    startTime: "09:00",
    endTime: "21:00",
    recurrenceType: "daily" as "once" | "daily" | "weekly",
    daysOfWeek: [1, 2, 3, 4, 5] as number[],
    priority: 0,
  });

  const [conflicts, setConflicts] = useState<any[]>([]);

  useEffect(() => {
    if (editSchedule) {
      setForm({
        screenId: editSchedule.screenId,
        playlistId: editSchedule.playlistId,
        startDate: editSchedule.startDate?.slice(0, 10) || "",
        endDate: editSchedule.endDate?.slice(0, 10) || "",
        noEndDate: !editSchedule.endDate,
        startTime: editSchedule.startTime,
        endTime: editSchedule.endTime,
        recurrenceType: editSchedule.recurrenceType,
        daysOfWeek: (editSchedule.daysOfWeek as number[]) || [],
        priority: editSchedule.priority,
      });
    } else {
      setForm((f) => ({
        ...f,
        screenId: defaultScreenId || f.screenId,
        startDate: new Date().toISOString().slice(0, 10),
      }));
    }
    setConflicts([]);
  }, [editSchedule, defaultScreenId, open]);

  const toggleDay = (day: number) => {
    setForm((f) => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day)
        ? f.daysOfWeek.filter((d) => d !== day)
        : [...f.daysOfWeek, day].sort(),
    }));
  };

  const handleSave = async () => {
    if (!form.screenId || !form.playlistId || !form.startDate || !form.startTime || !form.endTime) {
      toast({ title: "Please fill all required fields" });
      return;
    }

    const payload: any = {
      screenId: form.screenId,
      playlistId: form.playlistId,
      startDate: form.startDate,
      endDate: form.noEndDate ? null : form.endDate || null,
      startTime: form.startTime,
      endTime: form.endTime,
      recurrenceType: form.recurrenceType,
      daysOfWeek: form.recurrenceType === "weekly" ? form.daysOfWeek : undefined,
      priority: form.priority,
    };

    try {
      let result: any;
      if (editSchedule) {
        result = await updateSchedule({ id: editSchedule.id, body: payload }).unwrap();
      } else {
        result = await createSchedule(payload).unwrap();
      }

      const c = result.data?.conflicts;
      if (c?.hasConflict) {
        setConflicts(c.conflicts);
        toast({ title: `Schedule saved with ${c.conflicts.length} overlap warning(s)` });
      } else {
        toast({ title: editSchedule ? "Schedule updated" : "Schedule created" });
      }
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Failed to save" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editSchedule ? "Edit Schedule" : "Add Schedule"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Screen *</Label>
            <Select value={form.screenId || "none"} onValueChange={(v) => setForm({ ...form, screenId: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Select screen" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select screen</SelectItem>
                {screens.map((s) => <SelectItem key={s.id} value={s.id}>{s.screenName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Playlist *</Label>
            <Select value={form.playlistId || "none"} onValueChange={(v) => setForm({ ...form, playlistId: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Select playlist" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select playlist</SelectItem>
                {playlists.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} <span className="text-gray-400 ml-1">({p.status})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date *</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} disabled={form.noEndDate} />
              <label className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <input type="checkbox" checked={form.noEndDate} onChange={() => setForm({ ...form, noEndDate: !form.noEndDate, endDate: "" })} />
                No end date
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Time *</Label>
              <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div>
              <Label>End Time *</Label>
              <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Recurrence</Label>
            <Select value={form.recurrenceType} onValueChange={(v: any) => setForm({ ...form, recurrenceType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Once</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.recurrenceType === "weekly" && (
            <div>
              <Label className="text-xs">Days of Week</Label>
              <div className="flex gap-2 mt-1">
                {DAY_NAMES.map((name, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    className={`w-9 h-9 rounded-full text-xs font-medium border ${
                      form.daysOfWeek.includes(i)
                        ? "bg-purple-900 text-white border-purple-900"
                        : "bg-white text-gray-600 border-gray-300"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Priority (0–100, higher wins conflicts)</Label>
            <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} min={0} max={100} />
          </div>

          {conflicts.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Overlap Warning</span>
              </div>
              {conflicts.map((c: any, i: number) => (
                <p key={i} className="text-xs text-yellow-700">
                  Conflicts with "{c.playlistName}" ({c.startTime}–{c.endTime})
                </p>
              ))}
              <p className="text-xs text-yellow-600 mt-1">Priority determines which playlist plays during overlap.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-purple-900 hover:bg-purple-800">
            {editSchedule ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
