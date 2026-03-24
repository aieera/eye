export interface Screen {
  id: string;
  screenName: string;
  screenCode: string;
  deviceToken: string;
  locationId: string;
  location?: {
    id: string;
    name: string;
    oracleLocationId?: string;
  };
  status: "online" | "offline" | "error";
  lastHeartbeat: string | null;
  orientation: "landscape" | "portrait";
  resolution: string | null;
  appVersion: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenStats {
  total: number;
  online: number;
  offline: number;
  error: number;
}

export interface CreateScreenPayload {
  screenName: string;
  locationId: string;
  orientation?: "landscape" | "portrait";
  resolution?: string;
}

export interface ScreensListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "online" | "offline" | "error";
  locationId?: string;
}
