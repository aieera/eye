import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  useGetOfferByIdQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} from "../api/offerApi";
import { useGetProductsQuery } from "@/modules/products/api/productApi";
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
import { Trash2 } from "lucide-react";

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: offerRes } = useGetOfferByIdQuery(id as string, { skip: !id });
  const { data: productsRes } = useGetProductsQuery({ limit: 100 });
  const { data: locationsRes } = useGetLocationsQuery({ limit: 100 });

  const [createOffer, { isLoading: creating }] = useCreateOfferMutation();
  const [updateOffer, { isLoading: updating }] = useUpdateOfferMutation();
  const [deleteOffer] = useDeleteOfferMutation();

  const offer = offerRes?.data;
  const products = productsRes?.data ?? [];
  const locations = locationsRes?.data ?? [];

  const [form, setForm] = useState({
    name: "",
    title: "",
    description: "",
    productId: "",
    locationId: "",
    originalPrice: "",
    offerPrice: "",
    discountPercentage: "",
    imageUrl: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    if (id && offer) {
      setForm({
        name: offer.name,
        title: offer.title || "",
        description: offer.description || "",
        productId: offer.productId || "",
        locationId: offer.locationId || "",
        originalPrice: offer.originalPrice != null ? String(offer.originalPrice) : "",
        offerPrice: offer.offerPrice != null ? String(offer.offerPrice) : "",
        discountPercentage:
          offer.discountPercentage != null ? String(offer.discountPercentage) : "",
        imageUrl: offer.imageUrl || "",
        startDate: offer.startDate ? offer.startDate.slice(0, 10) : "",
        endDate: offer.endDate ? offer.endDate.slice(0, 10) : "",
        isActive: offer.isActive,
      });
    }
  }, [id, offer]);

  // Auto-calculate discount
  useEffect(() => {
    const orig = parseFloat(form.originalPrice);
    const offerP = parseFloat(form.offerPrice);
    if (orig > 0 && offerP > 0 && offerP < orig) {
      const pct = ((orig - offerP) / orig) * 100;
      setForm((f) => ({ ...f, discountPercentage: pct.toFixed(1) }));
    }
  }, [form.originalPrice, form.offerPrice]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.startDate || !form.endDate) {
      toast({ title: "Name and dates are required" });
      return;
    }

    const payload = {
      name: form.name,
      title: form.title || undefined,
      description: form.description || undefined,
      productId: form.productId || null,
      locationId: form.locationId || null,
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      offerPrice: form.offerPrice ? Number(form.offerPrice) : null,
      discountPercentage: form.discountPercentage ? Number(form.discountPercentage) : null,
      imageUrl: form.imageUrl || null,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    try {
      if (id) {
        await updateOffer({ id, body: { ...payload, isActive: form.isActive } }).unwrap();
        toast({ title: "Offer updated" });
      } else {
        await createOffer(payload).unwrap();
        toast({ title: "Offer created" });
      }
      navigate("/offers");
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Something went wrong" });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteOffer(id).unwrap();
      toast({ title: "Offer deleted" });
      navigate("/offers");
    } catch {
      toast({ title: "Error deleting offer" });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {id ? "Edit Offer" : "Create Offer"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Offers / {id ? form.name || "Edit" : "New Offer"}
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
                <AlertDialogTitle>Delete offer?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will deactivate the offer. This action cannot be undone.
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

      <div className="bg-card rounded-xl border border-border/60 p-5 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Offer name"
            />
          </div>
          <div>
            <Label>Title (display)</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Display title on screen"
            />
          </div>

          <div>
            <Label>Product</Label>
            <Select
              value={form.productId || "none"}
              onValueChange={(v) => setForm({ ...form, productId: v === "none" ? "" : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Product</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.externalItemCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Location</Label>
            <Select
              value={form.locationId || "none"}
              onValueChange={(v) => setForm({ ...form, locationId: v === "none" ? "" : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Original Price (AED)</Label>
            <Input
              type="number"
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label>Offer Price (AED)</Label>
            <Input
              type="number"
              value={form.offerPrice}
              onChange={(e) => setForm({ ...form, offerPrice: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label>Discount %</Label>
            <Input
              type="number"
              value={form.discountPercentage}
              onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
              placeholder="Auto-calculated"
            />
          </div>

          <div>
            <Label>Image URL</Label>
            <Input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label>Start Date *</Label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>

          <div>
            <Label>End Date *</Label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          {id && (
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label>Active</Label>
            </div>
          )}
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Offer description"
            rows={3}
          />
        </div>

        {id && offer && (
          <div className="text-sm text-muted-foreground">
            Source: <span className="font-medium capitalize">{offer.source}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/offers")}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={creating || updating}
          className="bg-primary hover:bg-primary/90"
        >
          {creating || updating ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
