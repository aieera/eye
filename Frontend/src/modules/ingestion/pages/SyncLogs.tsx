import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetSyncLogsQuery } from "../api/ingestionApi";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Pagination from "@/modules/screens/components/Pagination";

const statusColors: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  failed: "bg-red-50 text-red-700 border border-red-200",
  running: "bg-blue-50 text-blue-700 border border-blue-200",
};

const typeColors: Record<string, string> = {
  full: "border-primary/20 text-primary",
  incremental: "border-blue-200 text-blue-700",
  "price-only": "border-amber-200 text-amber-700",
};

export default function SyncLogs() {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const { data: res, isLoading } = useGetSyncLogsQuery({
    connectionId: id as string,
    page, limit: 20,
    status: statusFilter,
    syncType: typeFilter,
  }, { skip: !id });

  const logs = res?.data ?? [];
  const pagination = res?.meta?.pagination;

  const getDuration = (log: any) => {
    if (!log.completedAt) return "—";
    const ms = new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime();
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="p-6 space-y-5 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sync Logs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Data Sync / Logs</p>
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? undefined : v); setPage(1); }}>
          <SelectTrigger className="w-36 h-9 text-sm bg-card"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter || "all"} onValueChange={(v) => { setTypeFilter(v === "all" ? undefined : v); setPage(1); }}>
          <SelectTrigger className="w-40 h-9 text-sm bg-card"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full">Full</SelectItem>
            <SelectItem value="incremental">Incremental</SelectItem>
            <SelectItem value="price-only">Price Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center"><p className="text-sm text-muted-foreground">Loading...</p></div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No sync logs found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Processed</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Updated</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Failed</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 bg-card">
              {logs.map((log: any) => (
                <>
                  <tr
                    key={log.id}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  >
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(log.startedAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={typeColors[log.syncType] || ""}>{log.syncType}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${statusColors[log.status] || "bg-muted text-muted-foreground"}`}>{log.status}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{log.recordsProcessed}</td>
                    <td className="px-4 py-3 text-emerald-600 tabular-nums">{log.recordsCreated}</td>
                    <td className="px-4 py-3 text-blue-600 tabular-nums">{log.recordsUpdated}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {log.recordsFailed > 0 ? <span className="text-red-600 font-medium">{log.recordsFailed}</span> : <span className="text-muted-foreground">0</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{getDuration(log)}</td>
                  </tr>
                  {expandedLog === log.id && log.errorMessage && (
                    <tr key={`${log.id}-err`} className="bg-red-50/50">
                      <td colSpan={8} className="px-4 py-3">
                        <p className="text-xs font-medium text-red-700 mb-1">Error Details:</p>
                        <pre className="text-xs text-red-600 whitespace-pre-wrap font-mono">{log.errorMessage}</pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />}
    </div>
  );
}
