import { io, Socket } from "socket.io-client";
import { getAccessToken } from "../utils/cookies";

const SOCKET_URL =
  (import.meta.env.VITE_API_BASE_URL as string)?.replace("/api/v1", "") ||
  "http://localhost:3000";

let adminSocket: Socket | null = null;

export function connectAdminSocket(): Socket {
  if (adminSocket?.connected) return adminSocket;

  const token = getAccessToken();
  if (!token) throw new Error("No auth token for socket connection");

  adminSocket = io(`${SOCKET_URL}/admin`, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  adminSocket.on("connect", () =>
    console.log("Admin socket connected")
  );
  adminSocket.on("disconnect", (reason) =>
    console.log("Admin socket disconnected:", reason)
  );
  adminSocket.on("connect_error", (err) =>
    console.error("Admin socket error:", err.message)
  );

  return adminSocket;
}

export function disconnectAdminSocket() {
  if (adminSocket) {
    adminSocket.disconnect();
    adminSocket = null;
  }
}

export function getAdminSocket(): Socket | null {
  return adminSocket;
}
