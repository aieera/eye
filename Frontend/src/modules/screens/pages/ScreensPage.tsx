import { useState, useEffect } from "react";
import { useGetScreensQuery, useGetScreenStatsQuery } from "../api/screens.api";
import ScreenStats from "../components/ScreenStats";
import ScreenToolbar from "../components/ScreenToolbar";
import ScreenTable from "../components/ScreenTable";
import ScreenGrid from "../components/ScreenGrid";
import Pagination from "../components/Pagination";

export default function ScreensPage() {
  const [view, setView] = useState("list");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [locationFilter, setLocationFilter] = useState<string | undefined>();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, locationFilter]);

  const { data: screensRes, isLoading } = useGetScreensQuery({
    page,
    limit: view === "grid" ? 9 : 10,
    search: debouncedSearch || undefined,
    status: statusFilter as any,
    locationId: locationFilter,
  });

  const { data: statsRes, isLoading: statsLoading } = useGetScreenStatsQuery();

  const screens = screensRes?.data ?? [];
  const pagination = screensRes?.meta?.pagination;
  const stats = statsRes?.data;

  return (
    <div className="p-6 space-y-5 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Screens</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your display screens</p>
      </div>

      <ScreenStats stats={stats} isLoading={statsLoading} />

      <ScreenToolbar
        view={view} setView={setView}
        search={search} onSearchChange={setSearch}
        statusFilter={statusFilter} onStatusChange={setStatusFilter}
        locationFilter={locationFilter} onLocationChange={setLocationFilter}
      />

      {view === "list" ? (
        <ScreenTable screens={screens} />
      ) : (
        <ScreenGrid screens={screens} />
      )}

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
