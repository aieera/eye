import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ImageOff, Package } from "lucide-react";
import { useGetProductsQuery } from "../api/productApi";
import { useGetCategoryTreeQuery } from "@/modules/categories/api/categoryApi";
import { useGetLocationsQuery } from "@/modules/locations/api/locationApi";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/modules/screens/components/Pagination";
import type { Product } from "../types/product.types";

export default function Products() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [hasImageFilter, setHasImageFilter] = useState<string | undefined>();
  const [locationFilter, setLocationFilter] = useState<string | undefined>();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => { setPage(1); }, [debouncedSearch, categoryFilter, hasImageFilter, locationFilter]);

  const { data: productsRes, isLoading } = useGetProductsQuery({
    page, limit: 20,
    search: debouncedSearch || undefined,
    categoryId: categoryFilter,
    hasImage: hasImageFilter === "true" ? true : hasImageFilter === "false" ? false : undefined,
    locationId: locationFilter,
  });

  const { data: treeRes } = useGetCategoryTreeQuery();
  const { data: locationsRes } = useGetLocationsQuery({ limit: 100 });

  const products = productsRes?.data ?? [];
  const pagination = productsRes?.meta?.pagination;
  const categories = treeRes?.data ?? [];
  const locations = locationsRes?.data ?? [];

  const getPrice = (product: Product): string => {
    if (product.prices && product.prices.length > 0) {
      return Number(product.prices[0].unitRetail).toFixed(2);
    }
    return null as any;
  };

  return (
    <div className="p-6 space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your product catalog</p>
        </div>
        <button
          onClick={() => navigate("/products/new")}
          className="h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="h-9 rounded-lg border border-border bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors w-64"
          />
        </div>
        <Select value={categoryFilter || "all"} onValueChange={(v) => setCategoryFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-48 h-9 text-sm bg-card"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={hasImageFilter || "all"} onValueChange={(v) => setHasImageFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-36 h-9 text-sm bg-card"><SelectValue placeholder="Image" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Images</SelectItem>
            <SelectItem value="true">Has Image</SelectItem>
            <SelectItem value="false">No Image</SelectItem>
          </SelectContent>
        </Select>
        <Select value={locationFilter || "all"} onValueChange={(v) => setLocationFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-48 h-9 text-sm bg-card"><SelectValue placeholder="Price Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((loc) => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <div className="bg-muted/40 px-4 py-3 flex gap-4">
            {[80, 120, 200, 120, 100, 80].map((w, i) => <Skeleton key={i} className={`h-4 w-${w < 100 ? '[80px]' : w < 150 ? '[120px]' : '[200px]'}`} />)}
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-4 py-3.5 border-t border-border/40 flex gap-4 items-center">
              <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No products found</p>
          <p className="text-xs text-muted-foreground mb-4">Create your first product to get started</p>
          <button onClick={() => navigate("/products/new")} className="h-8 rounded-lg border border-border bg-card text-sm px-3 hover:bg-muted/50 transition-colors">
            Add Product
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 bg-card">
              {products.map((product) => {
                const price = getPrice(product);
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageOff className="w-4 h-4 text-muted-foreground/40" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{product.name}</p>
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">{product.externalItemCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {product.category?.name ? (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                          {product.category.name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {price ? (
                        <span className="font-mono tabular-nums text-sm">
                          <span className="text-muted-foreground text-xs mr-0.5">AED</span>
                          <span className="font-medium">{price}</span>
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${product.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
                        {product.isActive ? "Active" : "Inactive"}
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
