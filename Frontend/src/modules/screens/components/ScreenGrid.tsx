import ScreenStatusBadge from "./ScreenStatusBadge";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Screen } from "../types/screens.types";

interface Props {
  screens: Screen[];
}

export default function ScreenGrid({ screens }: Props) {
  const navigate = useNavigate();

  if (screens.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center">
        <p className="text-gray-500">No screens found</p>
        <p className="text-sm text-gray-400 mt-1">Create your first screen to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {screens.map((screen) => (
        <div
          key={screen.id}
          className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition"
        >
          <div className="relative">
            <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
              {screen.image ? (
                <img
                  src={screen.image}
                  alt={screen.screenName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm">No image</span>
              )}
            </div>
            <div className="absolute top-3 left-3">
              <ScreenStatusBadge status={screen.status} />
            </div>
            <button
              onClick={() => navigate(`/screens/${screen.id}`)}
              className="absolute top-3 right-3 bg-white rounded-full p-1 shadow hover:bg-gray-100"
            >
              <Eye size={16} />
            </button>
          </div>
          <div className="p-4">
            <p className="font-semibold text-sm">{screen.screenName}</p>
            <p className="text-xs text-gray-500 mt-1">
              {screen.location?.name ?? "No location"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
