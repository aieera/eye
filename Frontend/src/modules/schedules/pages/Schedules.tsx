import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useGetScreensQuery } from "@/modules/screens/api/screens.api";
import { useGetScheduleCalendarQuery, useDeleteScheduleMutation } from "../api/scheduleApi";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ScheduleForm from "../components/ScheduleForm";
import type { Schedule } from "../types/schedule.types";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PILL_COLORS = [
  "bg-primary/10 text-primary",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
];

export default function Schedules() {
  const { toast } = useToast();
  const now = new Date();
  const [selectedScreenId, setSelectedScreenId] = useState<string>("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [formOpen, setFormOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);

  const { data: screensRes } = useGetScreensQuery({ limit: 100 });
  const screens = screensRes?.data ?? [];

  const { data: calRes } = useGetScheduleCalendarQuery(
    { screenId: selectedScreenId, month, year },
    { skip: !selectedScreenId }
  );
  const calendar = calRes?.data ?? [];

  const [deleteSchedule] = useDeleteScheduleMutation();

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1);
  };

  const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const colorMap = new Map<string, string>();
  let colorIdx = 0;
  const getColor = (playlistId: string) => {
    if (!colorMap.has(playlistId)) { colorMap.set(playlistId, PILL_COLORS[colorIdx % PILL_COLORS.length]); colorIdx++; }
    return colorMap.get(playlistId)!;
  };

  const handleDeleteSchedule = async (id: string) => {
    try { await deleteSchedule(id).unwrap(); toast({ title: "Schedule deleted" }); }
    catch { toast({ title: "Error deleting", variant: "destructive" }); }
  };

  return (
    <div className="p-6 space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Schedules</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage screen content schedules</p>
        </div>
        <button
          onClick={() => { setEditSchedule(null); setFormOpen(true); }}
          className="h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Schedule
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <Select value={selectedScreenId || "none"} onValueChange={(v) => setSelectedScreenId(v === "none" ? "" : v)}>
          <SelectTrigger className="w-64 h-9 text-sm bg-card">
            <SelectValue placeholder="Select a screen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select a screen</SelectItem>
            {screens.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.screenName}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium w-44 text-center">{monthName}</span>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      {!selectedScreenId ? (
        <div className="rounded-xl border border-border/60 bg-card p-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-6 h-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Select a screen</p>
          <p className="text-xs text-muted-foreground">Choose a screen above to view its schedule calendar</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
          {/* Day headers */}
          <div className="grid grid-cols-7 bg-muted/40 border-b border-border/40">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider py-2.5">{d}</div>
            ))}
          </div>
          {/* Grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="min-h-24 border-t border-r border-border/40 bg-muted/10" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayData = calendar.find((c) => c.date === dateStr);
              const isToday = day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();

              return (
                <div key={day} className={cn("min-h-24 border-t border-r border-border/40 p-1.5", isToday && "ring-2 ring-inset ring-primary/30")}>
                  <div className={cn("text-xs font-medium mb-1 w-6 h-6 rounded-full flex items-center justify-center", isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayData?.schedules.map((s) => (
                      <div
                        key={s.id}
                        className={cn("text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer font-medium", getColor(s.playlistId))}
                        title={`${s.playlistName}: ${s.startTime}–${s.endTime}`}
                        onClick={() => toast({ title: `${s.playlistName}: ${s.startTime}–${s.endTime}` })}
                      >
                        {s.startTime} {s.playlistName}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ScheduleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editSchedule={editSchedule}
        defaultScreenId={selectedScreenId}
      />
    </div>
  );
}
