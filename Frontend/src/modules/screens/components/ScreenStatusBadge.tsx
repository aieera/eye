interface Props {
  status: "online" | "offline" | "error" | string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  online: { label: "Online", className: "bg-green-100 text-green-600" },
  offline: { label: "Offline", className: "bg-gray-100 text-gray-600" },
  error: { label: "Error", className: "bg-red-100 text-red-600" },
};

export default function ScreenStatusBadge({ status }: Props) {
  const config = statusConfig[status] || statusConfig.offline;
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
