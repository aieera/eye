import { useGetScreensQuery } from "@/modules/screens/api/screens.api";
import { PieChart, Pie, Cell } from "recharts";

const COLORS = [
  "#5B0E8B",
  "#7C1DC9",
  "#9333EA",
  "#A855F7",
  "#C084FC",
];

export default function ScreenStatus() {
  const { data: screens = [] } = useGetScreensQuery();
  const active = screens.length;
  const online = screens.filter(s => s.status === "online").length;
  const offline = screens.filter(s => s.status === "offline").length;
  const sync = screens.filter(s => s.status === "sync").length;

  const data = [
    { name: "Active Screens", value: active },
    { name: "Online Screens", value: online },
    { name: "Offline Screens", value: offline },
    { name: "Sync Errors", value: sync },
    { name: "Expired Soon", value: 6 },
  ];
  return (
    <div className="h-full flex flex-col items-center">

      {/* CHART */}
      <div className="flex justify-center mt-2 mb-2">
        <PieChart width={170} height={170}>
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>
          <Pie
            data={data}
            innerRadius={45}
            outerRadius={70}
            paddingAngle={2}
            cornerRadius={5}
            dataKey="value"
            stroke="none"
            filter="url(#shadow)"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </div>

      <div className="w-full px-2 text-sm space-y-2 mt-1">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">

            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-gray-600">{item.name}</span>
            </div>

            <span className="text-gray-800 font-medium">
              {item.value.toString().padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}