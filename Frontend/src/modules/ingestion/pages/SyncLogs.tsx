import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetSyncLogsQuery } from "../api/ingestionApi";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Pagination from "@/modules/screens/components/Pagination";

const statusColors: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  running: "bg-blue-100 text-blue-700",
};

const typeColors: Record<string, string> = {
  full: "border-purple-200 text-purple-700",
  incremental: "border-blue-200 text-blue-700",
  "price-only": "border-orange-200 text-orange-700",
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sync Logs</h1>
        <p className="text-sm text-gray-500">Data Sync / Logs</p>
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? undefined : v); setPage(1); }}>
          <SelectTrigger className="w-36 bg-white shadow border"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter || "all"} onValueChange={(v) => { setTypeFilter(v === "all" ? undefined : v); setPage(1); }}>
          <SelectTrigger className="w-40 bg-white shadow border"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full">Full</SelectItem>
            <SelectItem value="incremental">Incremental</SelectItem>
            <SelectItem value="price-only">Price Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border p-12 text-center"><p className="text-gray-500">Loading...</p></div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-500">No sync logs found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr className="text-left">
                <th className="px-4 py-3 font-normal">Date</th>
                <th className="px-4 py-3 font-normal">Type</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Processed</th>
                <th className="px-4 py-3 font-normal">Created</th>
                <th className="px-4 py-3 font-normal">Updated</th>
                <th className="px-4 py-3 font-normal">Failed</th>
                <th className="px-4 py-3 font-normal">Duration</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <>
                  <tr
                    key={log.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  >
                    <td className="px-4 py-3 text-xs">{new Date(log.startedAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={typeColors[log.syncType] || ""}>{log.syncType}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[log.status] || ""}`}>{log.status}</span>
                    </td>
                    <td className="px-4 py-3">{log.recordsProcessed}</td>
                    <td className="px-4 py-3 text-green-600">{log.recordsCreated}</td>
                    <td className="px-4 py-3 text-blue-600">{log.recordsUpdated}</td>
                    <td className="px-4 py-3 text-red-600">{log.recordsFailed}</td>
                    <td className="px-4 py-3 text-gray-500">{getDuration(log)}</td>
                  </tr>
                  {expandedLog === log.id && log.errorMessage && (
                    <tr key={`${log.id}-err`} className="bg-red-50">
                      <td colSpan={8} className="px-4 py-3">
                        <p className="text-xs font-medium text-red-700 mb-1">Error Details:</p>
                        <pre className="text-xs text-red-600 whitespace-pre-wrap">{log.errorMessage}</pre>
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
