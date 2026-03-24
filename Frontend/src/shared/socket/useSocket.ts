import { useEffect, useRef } from "react";
import { getAdminSocket } from "./socketClient";

export function useSocketEvent<T = any>(
  event: string,
  callback: (data: T) => void
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const socket = getAdminSocket();
    if (!socket) return;

    const handler = (data: T) => callbackRef.current(data);
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [event]);
}

export function useScreenStatusUpdates(
  callback: (data: {
    screenId: string;
    screenName: string;
    status: string;
    timestamp: string;
  }) => void
) {
  useSocketEvent("screen:status_changed", callback);
}

export function usePlaylistPublishUpdates(
  callback: (data: {
    playlistId: string;
    playlistName: string;
    version: number;
    affectedScreens: number;
    timestamp: string;
  }) => void
) {
  useSocketEvent("playlist:published", callback);
}

export function useSyncUpdates(callbacks: {
  onStarted?: (data: any) => void;
  onCompleted?: (data: any) => void;
  onFailed?: (data: any) => void;
}) {
  useSocketEvent("sync:started", (data: any) => callbacks.onStarted?.(data));
  useSocketEvent("sync:completed", (data: any) => callbacks.onCompleted?.(data));
  useSocketEvent("sync:failed", (data: any) => callbacks.onFailed?.(data));
}
