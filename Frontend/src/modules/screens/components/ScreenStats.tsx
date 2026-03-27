import { Monitor, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ScreenStats as ScreenStatsType } from "../types/screens.types";

interface Props {
  stats?: ScreenStatsType;
  isLoading?: boolean;
}

export default function ScreenStats({ stats, isLoading }: Props) {
  const items = [
    {
      title: "Total",
      value: stats?.total ?? 0,
      icon: Monitor,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Online",
      value: stats?.online ?? 0,
      icon: Wifi,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Offline",
      value: stats?.offline ?? 0,
      icon: WifiOff,
      iconBg: "bg-gray-50",
      iconColor: "text-gray-500",
    },
    {
      title: "Errors",
      value: stats?.error ?? 0,
      icon: AlertCircle,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border/60 p-5">
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-8 w-14" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className="bg-card rounded-xl border border-border/60 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.title}</p>
                <p className="text-3xl font-semibold tabular-nums mt-1">{item.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
