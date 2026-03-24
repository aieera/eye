import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  connectAdminSocket,
  disconnectAdminSocket,
} from "./socketClient";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSelector(
    (state: any) => state.auth.isAuthenticated
  );

  useEffect(() => {
    if (isAuthenticated) {
      try {
        connectAdminSocket();
      } catch (e) {
        console.error("Socket init failed:", e);
      }
    } else {
      disconnectAdminSocket();
    }
    return () => {
      disconnectAdminSocket();
    };
  }, [isAuthenticated]);

  return <>{children}</>;
}
