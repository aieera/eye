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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
        await updateScreen({
          id,
          body: {
            screenName: form.screenName,
            locationId: form.locationId,
            orientation: form.orientation,
            resolution: form.resolution || undefined,
          },
        }).unwrap();
        toast({ title: "Screen updated" });
        navigate("/screens");
      } else {
        const result = await createScreen({
          screenName: form.screenName,
          locationId: form.locationId,
          orientation: form.orientation,
          resolution: form.resolution || undefined,
        }).unwrap();

        setCreatedSecret({
          screenCode: result.data.screenCode,
          deviceToken: result.data.deviceToken,
          rawDeviceSecret: result.data.rawDeviceSecret,
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.data?.message || "Something went wrong",
      });
    }
  };

  const copyValue = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {id ? "Edit Screen" : "Add Screen"}
        </h1>
        <p className="text-sm text-gray-500">
          Screens / {id ? "Edit Screen" : "Add Screen"}
        </p>
      </div>

      <div className="bg-gray-100 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-6 max-w-2xl">
          <div className="col-span-2">
            <Label>Screen Name *</Label>
            <Input
              value={form.screenName}
              onChange={(e) => setForm({ ...form, screenName: e.target.value })}
              placeholder="e.g. Terminal 1 Gate 5"
            />
          </div>

          <div>
            <Label>Location *</Label>
            <Select
              value={form.locationId}
              onValueChange={(v) => setForm({ ...form, locationId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Orientation</Label>
            <Select
              value={form.orientation}
              onValueChange={(v) =>
                setForm({ ...form, orientation: v as "landscape" | "portrait" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="landscape">Landscape</SelectItem>
                <SelectItem value="portrait">Portrait</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Resolution</Label>
            <Input
              value={form.resolution}
              onChange={(e) => setForm({ ...form, resolution: e.target.value })}
              placeholder="e.g. 1920x1080"
            />
          </div>
        </div>
      </div>

      {/* Existing screen info */}
      {id && screenData && (
        <div className="bg-gray-100 rounded-xl p-6">
          <h2 className="font-semibold mb-3">Screen Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Screen Code:</span>{" "}
              <span className="font-mono">{screenData.screenCode}</span>
            </div>
            <div>
              <span className="text-gray-500">Device Token:</span>{" "}
              <span className="font-mono text-xs">{screenData.deviceToken}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span> {screenData.status}
            </div>
            <div>
              <span className="text-gray-500">Last Heartbeat:</span>{" "}
              {screenData.lastHeartbeat
                ? new Date(screenData.lastHeartbeat).toLocaleString()
                : "Never"}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/screens")}>
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

      {/* Created Secret Dialog */}
      <Dialog
        open={!!createdSecret}
        onOpenChange={(open) => {
          if (!open) {
            setCreatedSecret(null);
            navigate("/screens");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Screen Created Successfully</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0" />
                <span className="text-yellow-700 text-sm">
                  Save the device secret now. It cannot be retrieved later.
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {createdSecret &&
              [
                { label: "Screen Code", value: createdSecret.screenCode, field: "code" },
                { label: "Device Token", value: createdSecret.deviceToken, field: "token" },
                { label: "Device Secret", value: createdSecret.rawDeviceSecret, field: "secret" },
              ].map(({ label, value, field }) => (
                <div key={field}>
                  <Label className="text-xs text-gray-500">{label}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-xs bg-gray-100 p-2 rounded break-all">
                      {value}
                    </code>
                    <button
                      onClick={() => copyValue(value, field)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      {copiedField === field ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                setCreatedSecret(null);
                navigate("/screens");
              }}
              className="bg-purple-900 hover:bg-purple-800"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
