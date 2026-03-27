import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Copy, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateScreenMutation,
  useGetScreenByIdQuery,
  useUpdateScreenMutation,
} from "../api/screens.api";
import { useGetLocationsQuery } from "@/modules/locations/api/locationApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

export default function ManageScreens() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [createScreen, { isLoading: creating }] = useCreateScreenMutation();
  const [updateScreen, { isLoading: updating }] = useUpdateScreenMutation();
  const { data: screenRes } = useGetScreenByIdQuery(id as string, { skip: !id });
  const { data: locationsRes } = useGetLocationsQuery({ limit: 100 });

  const screenData = screenRes?.data;
  const locations = locationsRes?.data ?? [];

  const [form, setForm] = useState({
    screenName: "",
    locationId: "",
    orientation: "landscape" as "landscape" | "portrait",
    resolution: "",
  });

  const [createdSecret, setCreatedSecret] = useState<{
    screenCode: string;
    deviceToken: string;
    rawDeviceSecret: string;
  } | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (id && screenData) {
      setForm({
        screenName: screenData.screenName,
        locationId: screenData.locationId,
        orientation: screenData.orientation,
        resolution: screenData.resolution || "",
      });
    }
  }, [id, screenData]);

  const handleSubmit = async () => {
    if (!form.screenName.trim() || !form.locationId) {
      toast({ title: "Please fill required fields" });
      return;
    }
    try {
      if (id) {
        await updateScreen({ id, body: { screenName: form.screenName, locationId: form.locationId, orientation: form.orientation, resolution: form.resolution || undefined } }).unwrap();
        toast({ title: "Screen updated" });
        navigate("/screens");
      } else {
        const result = await createScreen({ screenName: form.screenName, locationId: form.locationId, orientation: form.orientation, resolution: form.resolution || undefined }).unwrap();
        setCreatedSecret({ screenCode: result.data.screenCode, deviceToken: result.data.deviceToken, rawDeviceSecret: result.data.rawDeviceSecret });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Something went wrong", variant: "destructive" });
    }
  };

  const copyValue = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className="p-6 space-y-5 animate-in fade-in duration-200 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{id ? "Edit Screen" : "Add Screen"}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Screens › {id ? "Edit Screen" : "Add Screen"}</p>
      </div>

      <div className="bg-card rounded-xl border border-border/60 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] p-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2 space-y-1.5">
            <Label>Screen Name *</Label>
            <Input value={form.screenName} onChange={(e) => setForm({ ...form, screenName: e.target.value })} placeholder="e.g. Terminal 1 Gate 5" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label>Location *</Label>
            <Select value={form.locationId} onValueChange={(v) => setForm({ ...form, locationId: v })}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>
                {locations.map((loc) => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Orientation</Label>
            <Select value={form.orientation} onValueChange={(v) => setForm({ ...form, orientation: v as "landscape" | "portrait" })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="landscape">Landscape</SelectItem>
                <SelectItem value="portrait">Portrait</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Resolution</Label>
            <Input value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })} placeholder="e.g. 1920x1080" className="h-9" />
          </div>
        </div>
      </div>

      {id && screenData && (
        <div className="bg-card rounded-xl border border-border/60 p-5">
          <h2 className="text-sm font-medium mb-3">Screen Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Screen Code</span>
              <p className="font-mono text-xs mt-0.5">{screenData.screenCode}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Status</span>
              <p className="mt-0.5 capitalize">{screenData.status}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Last Heartbeat</span>
              <p className="mt-0.5">{screenData.lastHeartbeat ? new Date(screenData.lastHeartbeat).toLocaleString() : "Never"}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/screens")} className="h-9">Cancel</Button>
        <Button onClick={handleSubmit} disabled={creating || updating} className="h-9 bg-primary hover:bg-primary/90">
          {creating || updating ? "Saving..." : "Save Screen"}
        </Button>
      </div>

      {/* Created Secret Dialog */}
      <Dialog open={!!createdSecret} onOpenChange={(open) => { if (!open) { setCreatedSecret(null); navigate("/screens"); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Screen Created</DialogTitle>
            <DialogDescription asChild>
              <div className="flex items-start gap-2 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-amber-700 text-sm">Save the device secret now. It cannot be retrieved later.</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {createdSecret && [
              { label: "Screen Code", value: createdSecret.screenCode, field: "code" },
              { label: "Device Token", value: createdSecret.deviceToken, field: "token" },
              { label: "Device Secret", value: createdSecret.rawDeviceSecret, field: "secret" },
            ].map(({ label, value, field }) => (
              <div key={field}>
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-xs bg-muted p-2 rounded-lg break-all font-mono">{value}</code>
                  <button onClick={() => copyValue(value, field)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                    {copiedField === field ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-2">
            <Button onClick={() => { setCreatedSecret(null); navigate("/screens"); }} className="bg-primary hover:bg-primary/90">Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
