import ScreenStatusBadge from "./ScreenStatusBadge";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function ScreenGrid({ screens }) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-3 gap-6">

      {screens.map((screen) => (
        <div
          key={screen.id}
          className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition"
        >

          {/* Image */}
          <div className="relative">

            <img
              src={screen.image}
              alt={screen.screenName}
              className="w-full h-40 object-cover"
            />

            {/* Status */}
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

          {/* Content */}
          <div className="p-4">

            <p className="font-semibold text-sm">
              {screen.screenName}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {screen.location}
            </p>

          </div>

        </div>
      ))}

    </div>
  );
}