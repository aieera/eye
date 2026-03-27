import { Search, Grid, List, ArrowUpDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PlaylistToolbar({ view, setView, search, setSearch }) {
  const navigate = useNavigate()
  return (
    <div className="flex justify-between items-center">

      {/* LEFT */}
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for Playlists"
            className="outline-none text-sm w-full"
          />
        </div>

        {/* Filter */}
        <button className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl shadow border text-sm">
          <Filter size={18} /> Filters
        </button>

        {/* Sort */}
        <button className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl shadow border text-sm">
          <ArrowUpDown size={18} /> Sort
        </button>

      </div>

      {/* Add Screens */}
      <button onClick={()=>navigate("/playlists/new")} className="bg-purple-900 text-white px-5 py-3 rounded-xl shadow hover:bg-purple-800">
        + Add Playlist
      </button>

    </div>
  );
}