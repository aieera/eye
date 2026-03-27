import { ReactNode } from "react";

type Props = {
  title: string;
  value: number;
  change?: number; 
  icon?: ReactNode;
};

export default function StatCard({ title, value, change, icon }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow flex justify-between items-start min-h-[110px]">
      <div>
        <p className="text-sm font-medium mt-2">{title}</p>
        <h2 className="text-2xl font-semibold mt-1">{value}</h2>


        {change !== undefined && (
          <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
            <span>↗</span>
            +{change}
          </div>
        )}
      </div>

      {/* RIGHT ICON */}
      <div className="bg-gray-100 p-2 rounded-full mt-1">
        {icon}
      </div>
    </div>
  );
}