import { Monitor, Wifi, WifiOff, AlertCircle } from "lucide-react";

export default function ScreenStats({ screens }) {
  const online = screens.filter((s) => s.status === "online").length;
  const offline = screens.filter((s) => s.status === "offline").length;
  const sync = screens.filter((s) => s.status === "sync").length;

  return (
    <div className="grid grid-cols-4 gap-5">

      <Stat title="Active Screens" value={screens.length} icon={<Monitor size={18} />} />

      <Stat title="Online Screens" value={online} icon={<Wifi size={18} />} />

      <Stat title="Offline Screens" value={offline} icon={<WifiOff size={18} />} />

      <Stat title="Sync Errors" value={sync} icon={<AlertCircle size={18} />} />

    </div>
  );
}

function Stat({ title, value, icon }) {
  return (
    <div className="bg-white px-6 py-7 rounded-2xl border shadow flex justify-between">

      <div>
        <p className="text-sm text-black font-semibold">{title}</p>
        <p className="text-3xl font-bold mt-5">{value}</p>
      </div>

      <div className="text-gray-400">
        {icon}
      </div>

    </div>
  );
}