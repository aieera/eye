import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ImageOff, Image as ImageIcon } from "lucide-react";
import { useGetProductsQuery } from "../api/productApi";
import { useGetCategoryTreeQuery } from "@/modules/categories/api/categoryApi";
import { useGetLocationsQuery } from "@/modules/locations/api/locationApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter, hasImageFilter, locationFilter]);

  const { data: productsRes, isLoading } = useGetProductsQuery({
    page,
    limit: 20,
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
      return `AED ${Number(product.prices[0].unitRetail).toFixed(2)}`;
    }
    return "—";
  };

  return (
    <div className="p-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <Button
          onClick={() => navigate("/products/new")}
          className="bg-purple-900 hover:bg-purple-800"
        >
          <Plus size={18} className="mr-2" /> Add Product
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow border w-72">
          <Search size={18} className="text-gray-400 mr-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="border-0 shadow-none p-0 h-auto focus-visible:ring-0"
          />
        </div>

        <Select
          value={categoryFilter || "all"}
          onValueChange={(v) => setCategoryFilter(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-48 bg-white shadow border">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={hasImageFilter || "all"}
          onValueChange={(v) => setHasImageFilter(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-40 bg-white shadow border">
            <SelectValue placeholder="Image Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Images</SelectItem>
            <SelectItem value="true">Has Image</SelectItem>
            <SelectItem value="false">No Image</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={locationFilter || "all"}
          onValueChange={(v) => setLocationFilter(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-48 bg-white shadow border">
            <SelectValue placeholder="Price Location" />
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

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <ImageOff size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No products found</p>
          <p className="text-sm text-gray-400 mt-1">Create your first product to get started</p>
          <Button
            onClick={() => navigate("/products/new")}
            className="mt-4 bg-purple-900 hover:bg-purple-800"
          >
            Add Product
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden border">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr className="text-left text-sm">
                <th className="px-4 py-3 font-normal w-16">Image</th>
                <th className="px-4 py-3 font-normal">Item Code</th>
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">Price</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal w-16">Img</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageOff size={16} className="text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {product.externalItemCode}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {product.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">{getPrice(product)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {product.hasValidImage ? (
                      <ImageIcon size={16} className="text-green-500 mx-auto" />
                    ) : (
                      <ImageOff size={16} className="text-gray-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
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
