import { Monitor, Package, Percent, ListVideo, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatDistanceToNow } from "date-fns";
import { useGetDashboardStatsQuery, useGetRecentActivityQuery } from "../api/dashboardApi";
import PageContainer from "@/shared/components/PageContainer";

const STATUS_COLORS: Record<string, string> = {
  online: "#22c55e",
  offline: "#6b7280",
  error: "#ef4444",
};

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: number | string;
  sub?: string;
  icon: any;
  variant?: "default" | "warning" | "success";
}) {
  const iconColor =
    variant === "warning" ? "text-destructive" : variant === "success" ? "text-green-500" : "text-primary";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ActivityFeed({ limit = 15 }: { limit?: number }) {
  const { data: activities, isLoading } = useGetRecentActivityQuery(limit);

  if (isLoading)
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 items-start">
            <Skeleton className="h-2 w-2 rounded-full mt-1.5" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );

  if (!activities?.length)
    return <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>;

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
      {activities.map((item) => (
        <div key={item.id} className="flex gap-3 items-start text-sm">
          <span
            className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
              item.type === "system"
                ? item.level === "error"
                  ? "bg-destructive"
                  : item.level === "warn"
                  ? "bg-yellow-500"
                  : "bg-blue-500"
                : "bg-purple-500"
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="truncate text-foreground">
              {item.type === "system"
                ? `[${item.module}] ${item.action} — ${item.message}`
                : `Screen: ${item.screen?.screenName ?? "?"} — ${item.eventType}`}
            </p>
            <p className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading, refetch } = useGetDashboardStatsQuery();

  const screenPieData = stats
    ? [
        { name: "Online", value: stats.screens.online, color: STATUS_COLORS.online },
        { name: "Offline", value: stats.screens.offline, color: STATUS_COLORS.offline },
        { name: "Error", value: stats.screens.error, color: STATUS_COLORS.error },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <PageContainer
      title="Dashboard"
      actions={
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      }
    >
      {/* Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Screens"
            value={stats.screens.total}
            sub={`${stats.screens.online} online · ${stats.screens.offline} offline`}
            icon={Monitor}
            variant={stats.screens.error > 0 ? "warning" : "success"}
          />
          <StatCard
            title="Products"
            value={stats.products.total}
            sub={`${stats.products.synced} synced · ${stats.products.withoutImages} missing images`}
            icon={Package}
          />
          <StatCard
            title="Active Offers"
            value={stats.offers.active}
            sub="Currently running promotions"
            icon={Percent}
            variant={stats.offers.active > 0 ? "success" : "default"}
          />
          <StatCard
            title="Playlists"
            value={stats.playlists.total}
            sub={`${stats.playlists.published} published`}
            icon={ListVideo}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Screen Status Pie */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Screen Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full rounded" />
            ) : screenPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={screenPieData} dataKey="value" cx="50%" cy="50%" outerRadius={65}>
                    {screenPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No screens configured</p>
            )}
          </CardContent>
        </Card>

        {/* Last Sync */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Last Oracle Sync</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
            ) : stats?.lastSync ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant={
                      stats.lastSync.status === "success"
                        ? "default"
                        : stats.lastSync.status === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {stats.lastSync.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Connection</span>
                  <span className="font-medium">{stats.lastSync.connection?.name ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{stats.lastSync.syncType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Processed</span>
                  <span>{stats.lastSync.recordsProcessed.toLocaleString()}</span>
                </div>
                {stats.lastSync.recordsFailed > 0 && (
                  <div className="flex items-center justify-between text-destructive">
                    <span>Failed</span>
                    <span>{stats.lastSync.recordsFailed}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">When</span>
                  <span className="text-xs">
                    {formatDistanceToNow(new Date(stats.lastSync.startedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No sync history</p>
            )}
          </CardContent>
        </Card>

        {/* Error Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Error Summary (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : stats ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">System errors</span>
                  <Badge variant={stats.errors.system > 0 ? "destructive" : "secondary"}>
                    {stats.errors.system}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Screen errors</span>
                  <Badge variant={stats.errors.screen > 0 ? "destructive" : "secondary"}>
                    {stats.errors.screen}
                  </Badge>
                </div>
                <div className="flex items-center justify-between font-medium border-t pt-2 mt-2">
                  <span>Total</span>
                  <Badge variant={stats.errors.total > 0 ? "destructive" : "default"}>
                    {stats.errors.total}
                  </Badge>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
