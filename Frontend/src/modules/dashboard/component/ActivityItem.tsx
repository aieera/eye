import { CheckCircle } from "lucide-react";

type Props = {
  status: "active" | "scheduled" | "expiring";
  title: string;
  subtitle: string;
};

const statusStyles = {
  active: "bg-green-100 text-green-600",
  scheduled: "bg-blue-100 text-blue-600",
  expiring: "bg-orange-100 text-orange-600",
};

export default function ActivityItem({ status, title, subtitle }: Props) {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow">

      {/* LEFT */}
      <div>
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusStyles[status]}`}
        >
          {status}
        </span>

        <p className="font-semibold mt-2 text-sm">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      {/* RIGHT ICON */}
      <div className="w-8 h-8 flex items-center justify-center border rounded-full">
        <CheckCircle className="w-4 h-4 text-gray-500" />
      </div>

    </div>
  );
}