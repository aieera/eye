import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductPricesMutation,
  useDeleteProductMutation,
} from "../api/productApi";
import { useGetCategoryTreeQuery } from "@/modules/categories/api/categoryApi";
import { useGetLocationsQuery } from "@/modules/locations/api/locationApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, ImageOff } from "lucide-react";

const UOM_OPTIONS = ["EA", "GM", "KG", "ML", "L", "PC", "PK", "BX", "BT", "CT"];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: productRes } = useGetProductByIdQuery(id as string, { skip: !id });
  const { data: treeRes } = useGetCategoryTreeQuery();
  const { data: locationsRes } = useGetLocationsQuery({ limit: 100 });

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [updatePrices] = useUpdateProductPricesMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const product = productRes?.data;
  const categories = treeRes?.data ?? [];
  const locations = locationsRes?.data ?? [];

  const [form, setForm] = useState({
    externalItemCode: "",
    name: "",
    shortName: "",
    description: "",
    categoryId: "",
    uom: "",
    isActive: true,
    imageUrl: "",
    videoUrl: "",
  });

  const [prices, setPrices] = useState<
    { locationId: string; unitRetail: string; sellingUnitRetail: string }[]
  >([]);

  useEffect(() => {
    if (id && product) {
      setForm({
        externalItemCode: product.externalItemCode,
        name: product.name,
        shortName: product.shortName || "",
        description: product.description || "",
        categoryId: product.categoryId || "",
        uom: product.uom || "",
        isActive: product.isActive,
        imageUrl: product.imageUrl || "",
        videoUrl: product.videoUrl || "",
      });

      if (product.prices) {
        setPrices(
          product.prices.map((p) => ({
            locationId: p.locationId,
            unitRetail: String(p.unitRetail),
            sellingUnitRetail: p.sellingUnitRetail ? String(p.sellingUnitRetail) : "",
          }))
        );
      }
    }
  }, [id, product]);

  const handleSubmit = async () => {
    if (!form.externalItemCode.trim() || !form.name.trim()) {
      toast({ title: "Item code and name are required" });
      return;
    }

    try {
      if (id) {
        await updateProduct({
          id,
          body: {
            name: form.name,
            shortName: form.shortName || undefined,
            description: form.description || undefined,
            categoryId: form.categoryId || undefined,
            uom: form.uom || undefined,
          },
        }).unwrap();
        toast({ title: "Product updated" });
      } else {
        const result = await createProduct({
          externalItemCode: form.externalItemCode,
          name: form.name,
          shortName: form.shortName || undefined,
          description: form.description || undefined,
          categoryId: form.categoryId || undefined,
          uom: form.uom || undefined,
        }).unwrap();
        toast({ title: "Product created" });
        navigate(`/products/${result.data.id}`);
        return;
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Something went wrong" });
    }
  };

  const handleSavePrices = async () => {
    if (!id) return;
    const validPrices = prices
      .filter((p) => p.locationId && p.unitRetail)
      .map((p) => ({
        locationId: p.locationId,
        unitRetail: Number(p.unitRetail),
        sellingUnitRetail: p.sellingUnitRetail ? Number(p.sellingUnitRetail) : undefined,
      }));

    if (validPrices.length === 0) return;

    try {
      await updatePrices({ id, body: { prices: validPrices } }).unwrap();
      toast({ title: "Prices updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Failed to update prices" });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteProduct(id).unwrap();
      toast({ title: "Product deleted" });
      navigate("/products");
    } catch {
      toast({ title: "Error deleting product" });
    }
  };

  const addPriceRow = () => {
    setPrices([...prices, { locationId: "", unitRetail: "", sellingUnitRetail: "" }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {id ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-sm text-gray-500">
            Products / {id ? form.name || "Edit" : "New Product"}
          </p>
        </div>
        {id && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 size={16} className="mr-2" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete product?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will deactivate this product. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="col-span-2 space-y-6">
          <div className="bg-gray-100 rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Item Code *</Label>
                <Input
                  value={form.externalItemCode}
                  onChange={(e) => setForm({ ...form, externalItemCode: e.target.value })}
                  disabled={!!id && product?.isSynced}
                  placeholder="e.g. ITEM001"
                />
              </div>
              <div>
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Product name"
                />
              </div>
              <div>
                <Label>Short Name</Label>
                <Input
                  value={form.shortName}
                  onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                  placeholder="Short display name"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={form.categoryId || "none"}
                  onValueChange={(v) => setForm({ ...form, categoryId: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>UOM</Label>
                <Select
                  value={form.uom || "none"}
                  onValueChange={(v) => setForm({ ...form, uom: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unit of measure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {UOM_OPTIONS.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <Label>Active</Label>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Product description"
                rows={3}
              />
            </div>
          </div>

          {/* Prices (edit mode only) */}
          {id && (
            <div className="bg-gray-100 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Prices (AED)</h3>
                <Button variant="outline" size="sm" onClick={addPriceRow}>
                  + Add Price
                </Button>
              </div>
              {prices.length > 0 ? (
                <div className="space-y-3">
                  {prices.map((price, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-3 items-end">
                      <div>
                        <Label className="text-xs">Location</Label>
                        <Select
                          value={price.locationId || "none"}
                          onValueChange={(v) => {
                            const updated = [...prices];
                            updated[idx].locationId = v === "none" ? "" : v;
                            setPrices(updated);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select</SelectItem>
                            {locations.map((loc) => (
                              <SelectItem key={loc.id} value={loc.id}>
                                {loc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Unit Retail (AED)</Label>
                        <Input
                          type="number"
                          value={price.unitRetail}
                          onChange={(e) => {
                            const updated = [...prices];
                            updated[idx].unitRetail = e.target.value;
                            setPrices(updated);
                          }}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Selling Price (AED)</Label>
                        <Input
                          type="number"
                          value={price.sellingUnitRetail}
                          onChange={(e) => {
                            const updated = [...prices];
                            updated[idx].sellingUnitRetail = e.target.value;
                            setPrices(updated);
                          }}
                          placeholder="0.00"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPrices(prices.filter((_, i) => i !== idx))}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                  <Button size="sm" onClick={handleSavePrices}>
                    Save Prices
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No prices set. Add a price row above.</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Image */}
        <div className="space-y-6">
          <div className="bg-gray-100 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold">Image</h3>
            <div className="w-full aspect-square bg-white rounded-lg border flex items-center justify-center overflow-hidden">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <ImageOff size={32} className="mx-auto mb-2" />
                  <p className="text-xs">No image</p>
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs">Image URL</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label className="text-xs">Video URL</Label>
              <Input
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/products")}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={creating || updating}
          className="bg-purple-900 hover:bg-purple-800"
        >
          {creating || updating ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
