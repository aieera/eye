import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalIcon, List, Trash2 } from "lucide-react";
import { useGetScreensQuery } from "@/modules/screens/api/screens.api";
import { useGetScheduleCalendarQuery, useDeleteScheduleMutation } from "../api/scheduleApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ScheduleForm from "../components/ScheduleForm";
import type { Schedule } from "../types/schedule.types";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const COLORS = ["bg-purple-200 text-purple-800", "bg-blue-200 text-blue-800", "bg-green-200 text-green-800", "bg-orange-200 text-orange-800", "bg-pink-200 text-pink-800", "bg-teal-200 text-teal-800"];

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
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  // Track playlist colors
  const colorMap = new Map<string, string>();
  let colorIdx = 0;
  const getColor = (playlistId: string) => {
    if (!colorMap.has(playlistId)) {
      colorMap.set(playlistId, COLORS[colorIdx % COLORS.length]);
      colorIdx++;
    }
    return colorMap.get(playlistId)!;
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await deleteSchedule(id).unwrap();
      toast({ title: "Schedule deleted" });
    } catch { toast({ title: "Error deleting" }); }
  };

  return (
    <div className="p-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Schedules</h1>
          <p className="text-sm text-gray-500 mt-1">Manage screen schedules</p>
        </div>
        <Button onClick={() => { setEditSchedule(null); setFormOpen(true); }} className="bg-purple-900 hover:bg-purple-800">
          <Plus size={18} className="mr-2" /> Add Schedule
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Select value={selectedScreenId || "none"} onValueChange={(v) => setSelectedScreenId(v === "none" ? "" : v)}>
          <SelectTrigger className="w-64 bg-white shadow border">
            <SelectValue placeholder="Select a screen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select a screen</SelectItem>
            {screens.map((s) => <SelectItem key={s.id} value={s.id}>{s.screenName}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft size={16} /></Button>
          <span className="text-sm font-medium w-40 text-center">{monthName}</span>
          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight size={16} /></Button>
        </div>
      </div>

      {/* Calendar */}
      {!selectedScreenId ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <CalIcon size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Select a screen to view its schedule</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-7 bg-gray-100">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
            ))}
          </div>
          {/* Grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="min-h-24 border-t border-r bg-gray-50" />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayData = calendar.find((c) => c.date === dateStr);
              const isToday =
                day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();

              return (
                <div key={day} className={`min-h-24 border-t border-r p-1 ${isToday ? "bg-purple-50" : ""}`}>
                  <div className={`text-xs font-medium mb-1 ${isToday ? "text-purple-700" : "text-gray-500"}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayData?.schedules.map((s) => (
                      <div
                        key={s.id}
                        className={`text-[10px] px-1 py-0.5 rounded truncate cursor-pointer ${getColor(s.playlistId)}`}
                        title={`${s.playlistName}: ${s.startTime}–${s.endTime}`}
                        onClick={() => {
                          // Could navigate to edit, for now just show toast
                          toast({ title: `${s.playlistName}: ${s.startTime}–${s.endTime}` });
                        }}
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
