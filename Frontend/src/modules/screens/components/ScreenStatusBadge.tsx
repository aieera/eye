interface Props {
  status: "online" | "offline" | "error" | string;
}

const statusConfig: Record<string, { label: string; dot: string; className: string }> = {
  online: {
    label: "Online",
    dot: "bg-emerald-500",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  offline: {
    label: "Offline",
    dot: "bg-gray-400",
    className: "bg-gray-50 text-gray-500 border border-gray-200",
  },
  error: {
    label: "Error",
    dot: "bg-red-500",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
};

export default function ScreenStatusBadge({ status }: Props) {
  const config = statusConfig[status] ?? statusConfig.offline;
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5 ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
