import { Search, Grid, List, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetLocationsQuery } from "@/modules/locations/api/locationApi";

interface Props {
  view: string;
  setView: (v: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
  statusFilter?: string;
  onStatusChange: (s: string | undefined) => void;
  locationFilter?: string;
  onLocationChange: (s: string | undefined) => void;
}

export default function ScreenToolbar({
  view, setView, search, onSearchChange,
  statusFilter, onStatusChange, locationFilter, onLocationChange,
}: Props) {
  const navigate = useNavigate();
  const { data: locationsRes } = useGetLocationsQuery({ limit: 100 });
  const locations = locationsRes?.data ?? [];

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search screens..."
            className="h-9 rounded-lg border border-border bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors w-64"
          />
        </div>

        {/* Status */}
        <Select
          value={statusFilter || "all"}
          onValueChange={(v) => onStatusChange(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-36 h-9 text-sm bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        {/* Location */}
        <Select
          value={locationFilter || "all"}
          onValueChange={(v) => onLocationChange(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-48 h-9 text-sm bg-card">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className="flex items-center bg-card rounded-lg border border-border p-1 gap-0.5">
          <button
            onClick={() => setView("list")}
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
              view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
              view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={() => navigate("/screens/new")}
        className="h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Screen
      </button>
    </div>
  );
}
