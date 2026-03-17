import { Search, Filter, ArrowUpDown } from "lucide-react";

export default function ProductToolbar({ search, setSearch }) {

  return (
    <div className="flex justify-between items-center">

      {/* LEFT - Search */}
      <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow w-72">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for Product"
          className="outline-none w-full text-sm"
        />
      </div>

      {/* RIGHT - Filter + Sort */}
      <div className="flex items-center gap-4">

        <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow border">
          <Filter size={18} /> Filters
        </button>

        <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow border">
          <ArrowUpDown size={18} /> Sort
        </button>

      </div>

    </div>
  );
}