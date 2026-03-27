import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetOffersQuery } from "../api/offerApi";
import { useGetLocationsQuery } from "@/modules/locations/api/locationApi";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/modules/screens/components/Pagination";
import type { Offer } from "../types/offer.types";

function getOfferStatus(offer: Offer): "active" | "expired" | "upcoming" {
  const now = new Date();
  const start = new Date(offer.startDate);
  const end = new Date(offer.endDate);
  if (end < now) return "expired";
  if (start > now) return "upcoming";
  return "active";
}

const STATUS_BADGE: Record<string, { dot: string; className: string; label: string }> = {
  active:   { dot: "bg-emerald-500", className: "bg-emerald-50 text-emerald-700 border border-emerald-200", label: "Active" },
  expired:  { dot: "bg-gray-400",    className: "bg-gray-50 text-gray-500 border border-gray-200", label: "Expired" },
  upcoming: { dot: "bg-blue-500",    className: "bg-blue-50 text-blue-700 border border-blue-200", label: "Upcoming" },
};

const TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "upcoming", label: "Upcoming" },
];

export default function Offers() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [locationFilter, setLocationFilter] = useState<string | undefined>();
  const [sourceFilter, setSourceFilter] = useState<string | undefined>();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => { setPage(1); }, [debouncedSearch, statusTab, locationFilter, sourceFilter]);

  const { data: offersRes, isLoading } = useGetOffersQuery({
    page, limit: 20,
    search: debouncedSearch || undefined,
    status: statusTab === "all" ? undefined : (statusTab as any),
    locationId: locationFilter,
    source: sourceFilter as any,
  });
  const { data: locationsRes } = useGetLocationsQuery({ limit: 100 });

  const offers = offersRes?.data ?? [];
  const pagination = offersRes?.meta?.pagination;
  const locations = locationsRes?.data ?? [];

  return (
    <div className="p-6 space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Offers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage promotional offers</p>
        </div>
        <button
          onClick={() => navigate("/offers/new")}
          className="h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Offer
        </button>
      </div>

      {/* Pill Tabs */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusTab(tab.value)}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              statusTab === tab.value
                ? "bg-card text-foreground font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search offers..."
            className="h-9 rounded-lg border border-border bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors w-64"
          />
        </div>
        <Select value={locationFilter || "all"} onValueChange={(v) => setLocationFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-48 h-9 text-sm bg-card"><SelectValue placeholder="All Locations" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((loc) => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sourceFilter || "all"} onValueChange={(v) => setSourceFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-36 h-9 text-sm bg-card"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="oracle">Oracle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
          {[...Array(6)].map((_, i) => <div key={i} className="px-4 py-3.5 border-b border-border/40"><Skeleton className="h-4 w-full" /></div>)}
        </div>
      ) : offers.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
            <Percent className="w-6 h-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No offers found</p>
          <p className="text-xs text-muted-foreground mb-4">Create your first promotional offer</p>
          <button onClick={() => navigate("/offers/new")} className="h-8 rounded-lg border border-border bg-card text-sm px-3 hover:bg-muted/50 transition-colors">Create Offer</button>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr>
                {["Name", "Product", "Location", "Price", "Dates", "Source", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 bg-card">
              {offers.map((offer) => {
                const status = getOfferStatus(offer);
                const badge = STATUS_BADGE[status];
                const startFmt = new Date(offer.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                const endFmt = new Date(offer.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                return (
                  <tr key={offer.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate(`/offers/${offer.id}`)}>
                    <td className="px-4 py-3.5 text-sm font-medium">{offer.name}</td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{offer.product?.name ?? "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{offer.location?.name ?? "—"}</td>
                    <td className="px-4 py-3.5">
                      {offer.originalPrice != null && offer.offerPrice != null ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs line-through text-muted-foreground">AED {Number(offer.originalPrice).toFixed(0)}</span>
                          <span className="font-mono text-sm text-emerald-600 font-semibold">AED {Number(offer.offerPrice).toFixed(0)}</span>
                          {offer.discountPercentage && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">-{Number(offer.discountPercentage).toFixed(0)}%</span>
                          )}
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground font-mono">{startFmt} → {endFmt}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${offer.source === "oracle" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-gray-50 text-gray-600 border border-gray-200"}`}>
                        {offer.source}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5 ${badge.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />}
    </div>
  );
}
