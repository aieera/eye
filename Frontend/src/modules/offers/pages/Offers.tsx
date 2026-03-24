import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Percent } from "lucide-react";
import { useGetOffersQuery } from "../api/offerApi";
import { useGetLocationsQuery } from "@/modules/locations/api/locationApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const statusBadgeConfig = {
  active: { label: "Active", className: "bg-green-100 text-green-700" },
  expired: { label: "Expired", className: "bg-red-100 text-red-700" },
  upcoming: { label: "Upcoming", className: "bg-yellow-100 text-yellow-700" },
};

export default function Offers() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusTab, setStatusTab] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string | undefined>();
  const [sourceFilter, setSourceFilter] = useState<string | undefined>();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusTab, locationFilter, sourceFilter]);

  const { data: offersRes, isLoading } = useGetOffersQuery({
    page,
    limit: 20,
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
    <div className="p-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Offers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promotional offers</p>
        </div>
        <Button
          onClick={() => navigate("/offers/new")}
          className="bg-purple-900 hover:bg-purple-800"
        >
          <Plus size={18} className="mr-2" /> Create Offer
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={statusTab} onValueChange={setStatusTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow border w-72">
          <Search size={18} className="text-gray-400 mr-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search offers..."
            className="border-0 shadow-none p-0 h-auto focus-visible:ring-0"
          />
        </div>

        <Select
          value={locationFilter || "all"}
          onValueChange={(v) => setLocationFilter(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-48 bg-white shadow border">
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

        <Select
          value={sourceFilter || "all"}
          onValueChange={(v) => setSourceFilter(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-36 bg-white shadow border">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="oracle">Oracle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-500">Loading offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Percent size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No offers found</p>
          <p className="text-sm text-gray-400 mt-1">Create your first offer to get started</p>
          <Button
            onClick={() => navigate("/offers/new")}
            className="mt-4 bg-purple-900 hover:bg-purple-800"
          >
            Create Offer
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden border">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr className="text-left text-sm">
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Product</th>
                <th className="px-4 py-3 font-normal">Location</th>
                <th className="px-4 py-3 font-normal">Price</th>
                <th className="px-4 py-3 font-normal">Discount</th>
                <th className="px-4 py-3 font-normal">Dates</th>
                <th className="px-4 py-3 font-normal">Source</th>
                <th className="px-4 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => {
                const status = getOfferStatus(offer);
                const badge = statusBadgeConfig[status];
                return (
                  <tr
                    key={offer.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/offers/${offer.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-medium">{offer.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {offer.product?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {offer.location?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {offer.originalPrice != null && offer.offerPrice != null ? (
                        <span>
                          <span className="line-through text-gray-400 mr-1">
                            AED {Number(offer.originalPrice).toFixed(0)}
                          </span>
                          <span className="text-green-600 font-medium">
                            AED {Number(offer.offerPrice).toFixed(0)}
                          </span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {offer.discountPercentage != null
                        ? `${Number(offer.discountPercentage).toFixed(0)}%`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(offer.startDate).toLocaleDateString()} –{" "}
                      {new Date(offer.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          offer.source === "oracle"
                            ? "border-purple-200 text-purple-700"
                            : "border-blue-200 text-blue-700"
                        }
                      >
                        {offer.source}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${badge.className}`}>
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
