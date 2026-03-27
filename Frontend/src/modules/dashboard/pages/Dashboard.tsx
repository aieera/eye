import { Monitor, Package, Percent, ListVideo, AlertTriangle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatDistanceToNow, format } from "date-fns";
import { useGetDashboardStatsQuery, useGetRecentActivityQuery } from "../api/dashboardApi";
import { useAppSelector } from "@/app/store";

const STATUS_COLORS: Record<string, string> = {
  online: "#22c55e",
  offline: "#6b7280",
  error: "#ef4444",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function ActivityFeed({ limit = 15 }: { limit?: number }) {
  const { data: activities, isLoading } = useGetRecentActivityQuery(limit);

  if (isLoading)
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 items-start">
            <Skeleton className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0" />
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
    <div className="relative space-y-0 max-h-72 overflow-y-auto pr-1">
      <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border/60" />
      {activities.map((item) => {
        const dotColor = item.type === "system"
          ? item.level === "error" ? "bg-red-500" : item.level === "warn" ? "bg-amber-500" : "bg-blue-500"
          : "bg-primary/60";
        return (
          <div key={item.id} className="flex gap-3 items-start text-sm py-2.5 pl-4 relative">
            <span className={`absolute left-0 mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ring-2 ring-background ${dotColor}`} />
            <div className="flex-1 min-w-0">
              <p className="truncate text-foreground text-xs">
                {item.type === "system"
                  ? `[${item.module}] ${item.action} — ${item.message}`
                  : `Screen: ${item.screen?.screenName ?? "?"} — ${item.eventType}`}
              </p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading, refetch } = useGetDashboardStatsQuery();
  const user = useAppSelector((state) => state.auth.user);

  const screenPieData = stats
    ? [
        { name: "Online", value: stats.screens.online, color: STATUS_COLORS.online },
        { name: "Offline", value: stats.screens.offline, color: STATUS_COLORS.offline },
        { name: "Error", value: stats.screens.error, color: STATUS_COLORS.error },
      ].filter((d) => d.value > 0)
    : [];

  const statCards = [
    {
      title: "Screens", icon: Monitor, iconBg: "bg-blue-50", iconColor: "text-blue-600",
      value: stats?.screens.total ?? 0,
      sub: stats ? `${stats.screens.online} online` : undefined,
    },
    {
      title: "Products", icon: Package, iconBg: "bg-amber-50", iconColor: "text-amber-600",
      value: stats?.products.total ?? 0,
      sub: stats ? `${stats.products.synced} synced` : undefined,
    },
    {
      title: "Active Offers", icon: Percent, iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
      value: stats?.offers.active ?? 0,
      sub: "Running promotions",
    },
    {
      title: "Playlists", icon: ListVideo, iconBg: "bg-purple-50", iconColor: "text-purple-600",
      value: stats?.playlists.total ?? 0,
      sub: stats ? `${stats.playlists.published} published` : undefined,
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">
            {getGreeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors h-8 px-3 rounded-lg hover:bg-muted/50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-card rounded-xl border border-border/60 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{card.title}</p>
                  {isLoading
                    ? <Skeleton className="h-8 w-14 mt-1" />
                    : <p className="text-3xl font-semibold tabular-nums mt-1">{card.value}</p>}
                  {card.sub && !isLoading && <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>}
                </div>
                <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Screen Status Pie */}
        <div className="bg-card rounded-xl border border-border/60 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] p-5">
          <h3 className="text-sm font-medium mb-4">Screen Overview</h3>
          {isLoading ? (
            <Skeleton className="h-44 w-full rounded" />
          ) : screenPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={screenPieData} dataKey="value" cx="50%" cy="50%" outerRadius={60}>
                  {screenPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No screens configured</p>
          )}
        </div>

        {/* Last Sync */}
        <div className="bg-card rounded-xl border border-border/60 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] p-5">
          <h3 className="text-sm font-medium mb-4">Last Oracle Sync</h3>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          ) : stats?.lastSync ? (
            <div className="space-y-2.5 text-sm">
              {[
                { label: "Status", value: <Badge variant={stats.lastSync.status === "success" ? "default" : stats.lastSync.status === "failed" ? "destructive" : "secondary"}>{stats.lastSync.status}</Badge> },
                { label: "Connection", value: stats.lastSync.connection?.name ?? "—" },
                { label: "Processed", value: stats.lastSync.recordsProcessed.toLocaleString() },
                { label: "When", value: formatDistanceToNow(new Date(stats.lastSync.startedAt), { addSuffix: true }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">{label}</span>
                  <span className="text-xs font-medium">{value as any}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No sync history</p>
          )}
        </div>

        {/* Error Summary */}
        <div className="bg-card rounded-xl border border-border/60 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] p-5">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Errors (24h)
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          ) : stats ? (
            <div className="space-y-3 text-sm">
              {[
                { label: "System errors", val: stats.errors.system },
                { label: "Screen errors", val: stats.errors.screen },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">{label}</span>
                  <Badge variant={val > 0 ? "destructive" : "secondary"}>{val}</Badge>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
                <span className="text-xs font-medium">Total</span>
                <Badge variant={stats.errors.total > 0 ? "destructive" : "default"}>{stats.errors.total}</Badge>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl border border-border/60 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] p-5">
        <h3 className="text-sm font-medium mb-4">Recent Activity</h3>
        <ActivityFeed />
      </div>
    </div>
  );
}
