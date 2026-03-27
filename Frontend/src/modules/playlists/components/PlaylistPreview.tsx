import { useEffect, useRef } from "react";
import type { PlaylistItem } from "../types/playlists.types";

interface Props {
  items: PlaylistItem[];
  transitionType: string;
  transitionDurationMs: number;
  isPlaying: boolean;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export default function PlaylistPreview({
  items, transitionType, transitionDurationMs,
  isPlaying, currentIndex, onIndexChange,
}: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isPlaying || items.length === 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const currentItem = items[currentIndex];
    const duration = (currentItem?.displayDurationSeconds ?? 5) * 1000;

    timerRef.current = setTimeout(() => {
      onIndexChange((currentIndex + 1) % items.length);
    }, duration);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, currentIndex, items, onIndexChange]);

  if (items.length === 0) {
    return (
      <div className="aspect-[16/10] bg-muted/60 rounded-xl border border-border/60 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No items to preview</p>
      </div>
    );
  }

  const item = items[currentIndex] || items[0];
  const transMs = transitionDurationMs;

  const transitionStyle: React.CSSProperties = {
    transition: transitionType === "none" ? "none" : `all ${transMs}ms ease-in-out`,
  };

  const renderContent = () => {
    switch (item.itemType) {
      case "product": {
        const img = item.product?.imageUrl;
        return (
          <div className="w-full h-full relative bg-black" style={transitionStyle}>
            {img ? (
              <img src={img} alt="" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <p className="text-white text-lg">{item.product?.name || "Product"}</p>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-white font-semibold text-sm">{item.product?.name}</p>
              <p className="text-gray-300 text-xs">{item.product?.externalItemCode}</p>
            </div>
          </div>
        );
      }
      case "offer": {
        const img = item.offer?.imageUrl;
        return (
          <div className="w-full h-full relative bg-gradient-to-br from-red-600 to-red-800" style={transitionStyle}>
            {img && <img src={img} alt="" className="w-full h-full object-contain opacity-40" />}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
              <p className="text-lg font-bold">{item.offer?.title || item.offer?.name}</p>
              {item.offer?.originalPrice != null && (
                <p className="line-through text-gray-300 text-sm">AED {Number(item.offer.originalPrice).toFixed(0)}</p>
              )}
              {item.offer?.offerPrice != null && (
                <p className="text-3xl font-bold mt-1">AED {Number(item.offer.offerPrice).toFixed(0)}</p>
              )}
              {item.offer?.discountPercentage != null && (
                <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded mt-2">
                  {Number(item.offer.discountPercentage).toFixed(0)}% OFF
                </span>
              )}
            </div>
          </div>
        );
      }
      case "custom": {
        const s = item.customStyle || {};
        return (
          <div
            className="w-full h-full flex items-center justify-center p-6"
            style={{
              backgroundColor: s.bgColor || "#6B21A8",
              backgroundImage: s.bgImage ? `url(${s.bgImage})` : undefined,
              backgroundSize: "cover",
              ...transitionStyle,
            }}
          >
            <p style={{
              color: s.textColor || "#FFFFFF",
              fontSize: `${s.fontSize || 32}px`,
              fontWeight: s.fontWeight || "bold",
              textAlign: s.textAlign || "center",
            }}>
              {item.customText || "Custom Text"}
            </p>
          </div>
        );
      }
      case "media":
        return (
          <div className="w-full h-full bg-black" style={transitionStyle}>
            {item.mediaUrl ? (
              <img src={item.mediaUrl} alt="" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-white">Media</p>
              </div>
            )}
          </div>
        );
      default:
        return <div className="w-full h-full bg-gray-800" />;
    }
  };

  return (
    <div className="aspect-[16/10] bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-700">
      {renderContent()}
    </div>
  );
}
