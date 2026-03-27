type Props = {
  title: string;
  discount: string;
  subtitle: string;
  status: "live" | "coming";
  endDate: string;
};

import { Calendar } from "lucide-react";

export default function OfferCard({ title, discount, subtitle, status, endDate }: Props) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="p-4 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 ${
          status === "live"
            ? "bg-green-100 text-green-600"
            : "bg-blue-100 text-blue-600"
        }`}>
          {status === "live" ? "🟢 Live Now" : "🔵 Coming Soon"}
        </span>

        <p className="text-lg font-semibold text-gray-800">{discount}</p>
      </div>

      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>

      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
        <Calendar className="w-3 h-3" />
        <span>Valid until: {formatDate(endDate)}</span>
      </div>
    </div>
  );
}