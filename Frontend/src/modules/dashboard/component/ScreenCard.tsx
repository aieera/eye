import { EyeIcon } from "lucide-react";

type Props = {
  image?: string;
  title: string;
  location: string;
  status: "online" | "offline" | "sync";
};

export default function ScreenCard({ image, title, location }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden relative">

      {/* Image */}
      <img src={image} className="h-40 w-full object-cover" />

      {/* Active badge */}
      <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
        Active
      </span>

      <div className="absolute top-2 right-2 bg-white p-0.5 rounded-full shadow">
  <EyeIcon className="w-4 h-4" />
</div>

      <div className="p-3">
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-gray-500">Location: {location}</p>
        <p className="text-xs text-gray-400 mt-1">
          Now Playing : Weekend Promo Playlist
        </p>
      </div>
    </div>
  );
}