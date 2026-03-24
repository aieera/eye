import { Monitor, Wifi, WifiOff, AlertCircle } from "lucide-react";
import type { ScreenStats as ScreenStatsType } from "../types/screens.types";

interface Props {
  stats?: ScreenStatsType;
  isLoading?: boolean;
}

export default function ScreenStats({ stats, isLoading }: Props) {
  const items = [
    { title: "Active Screens", value: stats?.total ?? 0, icon: <Monitor size={18} /> },
    { title: "Online Screens", value: stats?.online ?? 0, icon: <Wifi size={18} /> },
    { title: "Offline Screens", value: stats?.offline ?? 0, icon: <WifiOff size={18} /> },
    { title: "Errors", value: stats?.error ?? 0, icon: <AlertCircle size={18} /> },
  ];

  return (
    <div className="grid grid-cols-4 gap-5">
      {items.map((item) => (
        <div
          key={item.title}
          className="bg-white px-6 py-7 rounded-2xl border shadow flex justify-between"
        >
          <div>
            <p className="text-sm text-black font-semibold">{item.title}</p>
            <p className="text-3xl font-bold mt-5">
              {isLoading ? "—" : item.value}
            </p>
          </div>
          <div className="text-gray-400">{item.icon}</div>
        </div>
      ))}
    </div>
  );
}
