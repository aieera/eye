interface Props {
  status: string;
}

export default function ScreenStatusBadge({ status }: Props) {

  if (status === "online")
    return (
      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">
        Online
      </span>
    );

  if (status === "offline")
    return (
      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs">
        Offline
      </span>
    );

  return (
    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs">
      Sync
    </span>
  );
}