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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
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

  useSocketEvent("sync:completed", () => { refetch(); setSyncingIds(new Set()); });
  useSocketEvent("sync:failed", () => { refetch(); setSyncingIds(new Set()); });
  useSocketEvent("sync:started", (data: any) => { setSyncingIds((prev) => new Set(prev).add(data.connectionId)); });

  const handleSync = async (id: string, syncType: "full" | "incremental" | "price-only") => {
    try {
      await triggerSync({ connectionId: id, syncType }).unwrap();
      setSyncingIds((prev) => new Set(prev).add(id));
      toast({ title: `${syncType} sync queued` });
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Failed to start sync", variant: "destructive" });
    }
  };

  const handleTest = async (id: string) => {
    try {
      const r = await testConnection(id).unwrap();
      toast({ title: r.data.success ? "Connection OK" : "Connection failed", description: r.data.serverInfo || r.data.error });
    } catch (err: any) {
      toast({ title: "Test failed", description: err?.data?.message || "Error", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteConnection(deleteTarget).unwrap(); toast({ title: "Connection deleted" }); }
    catch { toast({ title: "Error deleting", variant: "destructive" }); }
    setDeleteTarget(null);
  };

  const getLastLog = (conn: IngestionConnection) => conn.ingestionLogs?.[0];

  return (
    <div className="p-6 space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Data Sync</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage Oracle database connections and sync</p>
        </div>
        <button
          onClick={() => navigate("/ingestion/new")}
          className="h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Connection
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5">
          {[...Array(2)].map((_, i) => <div key={i} className="rounded-xl border border-border/60 bg-card h-36 animate-pulse" />)}
        </div>
      ) : connections.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
            <Database className="w-6 h-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No connections configured</p>
          <p className="text-xs text-muted-foreground mb-4">Add an Oracle database connection to start syncing products</p>
          <button onClick={() => navigate("/ingestion/new")} className="h-8 rounded-lg border border-border bg-card text-sm px-3 hover:bg-muted/50 transition-colors">
            Add Connection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {connections.map((conn: IngestionConnection) => {
            const lastLog = getLastLog(conn);
            const isSyncing = syncingIds.has(conn.id) || lastLog?.status === "running";

            return (
              <div
                key={conn.id}
                className={cn(
                  "bg-card rounded-xl border p-5 hover:shadow-md transition-shadow duration-200",
                  isSyncing ? "border-blue-200 shadow-sm" : "border-border/60"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", conn.isActive ? "bg-emerald-50" : "bg-muted")}>
                      <Database className={cn("w-5 h-5", conn.isActive ? "text-emerald-600" : "text-muted-foreground/40")} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium">{conn.name}</h3>
                        {isSyncing && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 animate-pulse flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Syncing
                          </span>
                        )}
                        {!isSyncing && lastLog && (
                          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md", lastLog.status === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200")}>
                            {lastLog.status === "success" ? <CheckCircle className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}
                            {lastLog.syncType}: {lastLog.recordsProcessed} records
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {conn.connectionType}{!conn.isActive && " · inactive"}
                        {conn.lastSyncAt && ` · synced ${formatDistanceToNow(new Date(conn.lastSyncAt), { addSuffix: true })}`}
                      </p>
                    </div>
                  </div>
                  {/* Status dot */}
                  <span className={cn("w-2 h-2 rounded-full mt-1", conn.isActive ? "bg-emerald-500" : "bg-gray-300")} />
                </div>

                <div className="flex items-center gap-1.5 mt-4 flex-wrap">
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleTest(conn.id)}>Test</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleSync(conn.id, "full")} disabled={isSyncing}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Full Sync
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleSync(conn.id, "incremental")} disabled={isSyncing}>
                    <Zap className="w-3.5 h-3.5 mr-1" /> Incremental
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleSync(conn.id, "price-only")} disabled={isSyncing}>
                    <DollarSign className="w-3.5 h-3.5 mr-1" /> Prices
                  </Button>
                  <div className="ml-auto flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => navigate(`/ingestion/${conn.id}/mappings`)}>
                      <Settings2 className="w-3.5 h-3.5 mr-1" /> Mappings
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => navigate(`/ingestion/${conn.id}/logs`)}>
                      <FileText className="w-3.5 h-3.5 mr-1" /> Logs
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => navigate(`/ingestion/${conn.id}`)}>Edit</Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600" onClick={() => setDeleteTarget(conn.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
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
