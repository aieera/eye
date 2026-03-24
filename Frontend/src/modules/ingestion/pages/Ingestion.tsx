import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Database, RefreshCw, Zap, DollarSign, Settings2, FileText, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  useGetConnectionsQuery,
  useDeleteConnectionMutation,
  useTriggerSyncMutation,
  useTestSavedConnectionMutation,
} from "../api/ingestionApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useSocketEvent } from "@/shared/socket/useSocket";
import type { IngestionConnection } from "../types/ingestion.types";

export default function Ingestion() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: res, isLoading, refetch } = useGetConnectionsQuery();
  const [deleteConnection] = useDeleteConnectionMutation();
  const [triggerSync] = useTriggerSyncMutation();
  const [testConnection] = useTestSavedConnectionMutation();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());

  const connections = res?.data ?? [];

  // Listen for sync events to refresh
  useSocketEvent("sync:completed", () => { refetch(); setSyncingIds(new Set()); });
  useSocketEvent("sync:failed", () => { refetch(); setSyncingIds(new Set()); });
  useSocketEvent("sync:started", (data: any) => {
    setSyncingIds((prev) => new Set(prev).add(data.connectionId));
  });

  const handleSync = async (id: string, syncType: "full" | "incremental" | "price-only") => {
    try {
      await triggerSync({ connectionId: id, syncType }).unwrap();
      setSyncingIds((prev) => new Set(prev).add(id));
      toast({ title: `${syncType} sync queued` });
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Failed to start sync" });
    }
  };

  const handleTest = async (id: string) => {
    try {
      const r = await testConnection(id).unwrap();
      toast({ title: r.data.success ? "Connection OK" : "Connection failed", description: r.data.serverInfo || r.data.error });
    } catch (err: any) {
      toast({ title: "Test failed", description: err?.data?.message || "Error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteConnection(deleteTarget).unwrap(); toast({ title: "Connection deleted" }); }
    catch { toast({ title: "Error deleting" }); }
    setDeleteTarget(null);
  };

  const getLastLog = (conn: IngestionConnection) => conn.ingestionLogs?.[0];

  return (
    <div className="p-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Data Sync</h1>
          <p className="text-sm text-gray-500 mt-1">Manage Oracle database connections and sync</p>
        </div>
        <Button onClick={() => navigate("/ingestion/new")} className="bg-purple-900 hover:bg-purple-800">
          <Plus size={18} className="mr-2" /> Add Connection
        </Button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border p-12 text-center"><p className="text-gray-500">Loading...</p></div>
      ) : connections.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Database size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No connections configured</p>
          <p className="text-sm text-gray-400 mt-1">Add an Oracle database connection to start syncing products</p>
          <Button onClick={() => navigate("/ingestion/new")} className="mt-4 bg-purple-900 hover:bg-purple-800">
            Add Connection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {connections.map((conn: IngestionConnection) => {
            const lastLog = getLastLog(conn);
            const isSyncing = syncingIds.has(conn.id) || lastLog?.status === "running";

            return (
              <div key={conn.id} className="bg-white rounded-xl border p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${conn.isActive ? "bg-green-100" : "bg-gray-100"}`}>
                      <Database size={20} className={conn.isActive ? "text-green-600" : "text-gray-400"} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{conn.name}</h3>
                      <p className="text-xs text-gray-400">
                        {conn.connectionType} {conn.isActive ? "" : "(inactive)"}
                        {conn.lastSyncAt && ` • Last sync: ${new Date(conn.lastSyncAt).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSyncing && <Loader2 size={16} className="animate-spin text-purple-600" />}
                    {lastLog && (
                      <Badge variant={lastLog.status === "success" ? "default" : lastLog.status === "failed" ? "destructive" : "secondary"}>
                        {lastLog.status === "success" && <CheckCircle size={12} className="mr-1" />}
                        {lastLog.status === "failed" && <XCircle size={12} className="mr-1" />}
                        {lastLog.syncType}: {lastLog.recordsProcessed} records
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => handleTest(conn.id)}>Test</Button>
                  <Button size="sm" variant="outline" onClick={() => handleSync(conn.id, "full")} disabled={isSyncing}>
                    <RefreshCw size={14} className="mr-1" /> Full Sync
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleSync(conn.id, "incremental")} disabled={isSyncing}>
                    <Zap size={14} className="mr-1" /> Incremental
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleSync(conn.id, "price-only")} disabled={isSyncing}>
                    <DollarSign size={14} className="mr-1" /> Prices Only
                  </Button>
                  <div className="ml-auto flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/ingestion/${conn.id}/mappings`)}>
                      <Settings2 size={14} className="mr-1" /> Mappings
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/ingestion/${conn.id}/logs`)}>
                      <FileText size={14} className="mr-1" /> Logs
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/ingestion/${conn.id}`)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(conn.id)}>
                      <Trash2 size={14} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete connection?</AlertDialogTitle>
            <AlertDialogDescription>This will deactivate the connection and stop syncing.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
