import { Search, Grid, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  view,
  setView,
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  locationFilter,
  onLocationChange,
}: Props) {
  const navigate = useNavigate();
  const { data: locationsRes } = useGetLocationsQuery({ limit: 100 });
  const locations = locationsRes?.data ?? [];

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        {/* Grid/List Toggle */}
        <div className="flex items-center bg-white rounded-xl border shadow p-1">
          <Button
            size="icon"
            onClick={() => setView("grid")}
            className={`rounded-xl ${
              view === "grid"
                ? "bg-purple-900 hover:bg-purple-800 text-white"
                : "bg-transparent text-black hover:bg-gray-100"
            }`}
          >
            <Grid size={20} />
          </Button>
          <Button
            size="icon"
            onClick={() => setView("list")}
            className={`rounded-xl ${
              view === "list"
                ? "bg-purple-900 hover:bg-purple-800 text-white"
                : "bg-transparent text-black hover:bg-gray-100"
            }`}
          >
            <List size={20} />
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white px-5 py-3 rounded-xl shadow w-72">
          <Search size={18} className="text-gray-400 mr-3" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for Screens"
            className="outline-none text-sm w-full bg-transparent"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={statusFilter || "all"}
          onValueChange={(v) => onStatusChange(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-36 bg-white rounded-xl shadow border">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        {/* Location Filter */}
        <Select
          value={locationFilter || "all"}
          onValueChange={(v) => onLocationChange(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-48 bg-white rounded-xl shadow border">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Add Screens */}
      <button
        onClick={() => navigate("/screens/new")}
        className="bg-purple-900 text-white px-5 py-3 rounded-xl shadow hover:bg-purple-800"
      >
        + Add Screen
      </button>
    </div>
  );
}
