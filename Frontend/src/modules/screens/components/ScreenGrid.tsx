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
      <div className="rounded-xl border border-border/60 bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">No screens found</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Create your first screen to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-5">
      {screens.map((screen) => (
        <div
          key={screen.id}
          className="bg-card rounded-xl border border-border/60 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="relative">
            <div className="w-full h-40 bg-muted/40 flex items-center justify-center">
              {screen.image ? (
                <img
                  src={screen.image}
                  alt={screen.screenName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-muted-foreground text-sm">No image</span>
              )}
            </div>
            <div className="absolute top-3 left-3">
              <ScreenStatusBadge status={screen.status} />
            </div>
            <button
              onClick={() => navigate(`/screens/${screen.id}`)}
              className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:bg-card border border-border/60 transition-colors"
            >
              <Eye size={16} />
            </button>
          </div>
          <div className="p-4">
            <p className="font-medium text-sm">{screen.screenName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {screen.location?.name ?? "No location"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
