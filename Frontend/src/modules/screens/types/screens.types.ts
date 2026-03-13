export interface Screen {
  id: string;
  screenName: string;
  location: string;
  locationId : string;
  screenCode: string;
  status: "online" | "offline" | "sync";
  createdAt: string;
  lastSync: string;
  image?: string;

  latitude?: string;
  longitude?: string;
  address?: string;
  playlists?: any[];
}