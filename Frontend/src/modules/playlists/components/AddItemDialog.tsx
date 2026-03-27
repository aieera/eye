import { useState } from "react";
import { useGetProductsQuery } from "@/modules/products/api/productApi";
import { useGetActiveOffersQuery } from "@/modules/offers/api/offerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: any) => void;
  defaultDuration: number;
}

export default function AddItemDialog({ open, onOpenChange, onAdd, defaultDuration }: Props) {
  const [tab, setTab] = useState("product");
  const [duration, setDuration] = useState(defaultDuration);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [customBgColor, setCustomBgColor] = useState("#6B21A8");
  const [customTextColor, setCustomTextColor] = useState("#FFFFFF");
  const [customFontSize, setCustomFontSize] = useState(32);
  const [mediaUrl, setMediaUrl] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const { data: productsRes } = useGetProductsQuery({ limit: 50, search: productSearch || undefined });
  const { data: offersRes } = useGetActiveOffersQuery();
  const products = productsRes?.data ?? [];
  const offers = offersRes?.data ?? [];

  const handleAdd = () => {
    let data: any = { displayDurationSeconds: duration, displayOrder: 0 };

    if (tab === "product" && selectedProductId) {
      data = { ...data, itemType: "product", productId: selectedProductId };
    } else if (tab === "offer" && selectedOfferId) {
      data = { ...data, itemType: "offer", offerId: selectedOfferId };
    } else if (tab === "custom" && customText.trim()) {
      data = {
        ...data, itemType: "custom", customText,
        customStyle: { bgColor: customBgColor, textColor: customTextColor, fontSize: customFontSize, textAlign: "center" },
      };
    } else if (tab === "media" && mediaUrl.trim()) {
      data = { ...data, itemType: "media", mediaUrl };
    } else {
      return;
    }

    onAdd(data);
    // Reset
    setSelectedProductId(null);
    setSelectedOfferId(null);
    setCustomText("");
    setMediaUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Item to Playlist</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="offer">Offer</TabsTrigger>
            <TabsTrigger value="custom">Custom Text</TabsTrigger>
            <TabsTrigger value="media">Media URL</TabsTrigger>
          </TabsList>

          <TabsContent value="product" className="space-y-3 mt-4">
            <Input placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${selectedProductId === p.id ? "bg-primary/[0.08] border border-primary/20" : "hover:bg-muted/50"}`}
                >
                  <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.externalItemCode} • {p.category?.name || "No category"}</p>
                  </div>
                </button>
              ))}
              {products.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No products found</p>}
            </div>
          </TabsContent>

          <TabsContent value="offer" className="space-y-3 mt-4">
            <div className="max-h-64 overflow-y-auto space-y-1">
              {offers.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOfferId(o.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${selectedOfferId === o.id ? "bg-primary/[0.08] border border-primary/20" : "hover:bg-muted/50"}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{o.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.offerPrice != null && `AED ${Number(o.offerPrice).toFixed(0)}`}
                      {o.discountPercentage != null && ` (${Number(o.discountPercentage).toFixed(0)}% off)`}
                    </p>
                  </div>
                </button>
              ))}
              {offers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No active offers</p>}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-3 mt-4">
            <Textarea value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="Enter text to display..." rows={3} />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">BG Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={customBgColor} onChange={(e) => setCustomBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <Input value={customBgColor} onChange={(e) => setCustomBgColor(e.target.value)} className="text-xs" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Text Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={customTextColor} onChange={(e) => setCustomTextColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <Input value={customTextColor} onChange={(e) => setCustomTextColor(e.target.value)} className="text-xs" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Font Size</Label>
                <Input type="number" value={customFontSize} onChange={(e) => setCustomFontSize(Number(e.target.value))} min={12} max={128} />
              </div>
            </div>
            {customText && (
              <div className="aspect-[16/10] rounded-lg overflow-hidden" style={{ backgroundColor: customBgColor }}>
                <div className="w-full h-full flex items-center justify-center p-4">
                  <p style={{ color: customTextColor, fontSize: `${Math.min(customFontSize, 24)}px`, fontWeight: "bold", textAlign: "center" }}>{customText}</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="media" className="space-y-3 mt-4">
            <Input placeholder="https://..." value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} />
            {mediaUrl && (
              <div className="aspect-[16/10] rounded-lg overflow-hidden bg-muted/40">
                <img src={mediaUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t">
          <Label className="text-sm">Duration (seconds):</Label>
          <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={1} max={300} className="w-24" />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90">Add to Playlist</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
