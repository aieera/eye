import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  useGetConnectionQuery,
  useCreateConnectionMutation,
  useUpdateConnectionMutation,
  useTestConnectionUnsavedMutation,
} from "../api/ingestionApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function ConnectionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: connRes } = useGetConnectionQuery(id as string, { skip: !id });
  const [createConnection, { isLoading: creating }] = useCreateConnectionMutation();
  const [updateConnection, { isLoading: updating }] = useUpdateConnectionMutation();
  const [testConnection, { isLoading: testing }] = useTestConnectionUnsavedMutation();

  const connection = connRes?.data;

  const [form, setForm] = useState({
    name: "",
    host: "",
    port: 1521,
    serviceName: "",
    username: "",
    password: "",
    syncIntervalMinutes: 60,
  });

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (id && connection) {
      setForm({
        name: connection.name,
        host: "",
        port: 1521,
        serviceName: "",
        username: "",
        password: "",
        syncIntervalMinutes: connection.syncIntervalMinutes,
      });
    }
  }, [id, connection]);

  const handleTest = async () => {
    if (!form.host || !form.serviceName || !form.username || !form.password) {
      toast({ title: "Fill all connection fields first" });
      return;
    }
    try {
      const r = await testConnection({
        host: form.host, port: form.port, serviceName: form.serviceName,
        username: form.username, password: form.password,
      }).unwrap();
      setTestResult({ success: r.data.success, message: r.data.serverInfo || r.data.error || "" });
    } catch (err: any) {
      setTestResult({ success: false, message: err?.data?.message || "Test failed" });
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Name is required" }); return; }

    try {
      if (id) {
        const body: any = { name: form.name, syncIntervalMinutes: form.syncIntervalMinutes };
        if (form.host) body.host = form.host;
        if (form.serviceName) body.serviceName = form.serviceName;
        if (form.username) body.username = form.username;
        if (form.password) body.password = form.password;
        if (form.port) body.port = form.port;
        await updateConnection({ id, body }).unwrap();
        toast({ title: "Connection updated" });
      } else {
        if (!form.host || !form.serviceName || !form.username || !form.password) {
          toast({ title: "All connection fields are required" });
          return;
        }
        await createConnection(form).unwrap();
        toast({ title: "Connection created" });
      }
      navigate("/ingestion");
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Failed to save" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{id ? "Edit Connection" : "Add Connection"}</h1>
        <p className="text-sm text-gray-500">Data Sync / {id ? "Edit" : "New Connection"}</p>
      </div>

      <div className="bg-gray-100 rounded-xl p-6 space-y-4 max-w-2xl">
        <div>
          <Label>Connection Name *</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Oracle Production" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Host *</Label>
            <Input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="oracle.example.com" />
          </div>
          <div>
            <Label>Port</Label>
            <Input type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Service Name *</Label>
            <Input value={form.serviceName} onChange={(e) => setForm({ ...form, serviceName: e.target.value })} placeholder="ORCL" />
          </div>
          <div>
            <Label>Sync Interval (min)</Label>
            <Input type="number" value={form.syncIntervalMinutes} onChange={(e) => setForm({ ...form, syncIntervalMinutes: Number(e.target.value) })} min={5} max={1440} />
          </div>
          <div>
            <Label>Username *</Label>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="SYSTEM" />
          </div>
          <div>
            <Label>Password *</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
        </div>

        {id && (
          <p className="text-xs text-gray-400">Leave host/port/username/password blank to keep existing values.</p>
        )}

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleTest} disabled={testing}>
            {testing ? <Loader2 size={14} className="mr-1 animate-spin" /> : null}
            Test Connection
          </Button>
          {testResult && (
            <div className={`flex items-center gap-1 text-sm ${testResult.success ? "text-green-600" : "text-red-600"}`}>
              {testResult.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {testResult.message}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/ingestion")}>Cancel</Button>
        <Button onClick={handleSave} disabled={creating || updating} className="bg-purple-900 hover:bg-purple-800">
          {creating || updating ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
