export interface PlaylistAssignment {
  playlistId: string;
  playlistName: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

export interface Screen {
  id: string;
  screenName: string;
  location: string;
  locationId: string;
  screenCode: string;
  status: "online" | "offline" | "sync";
  createdAt: string;
  lastSync: string;
  image?: string;

  latitude?: string;
  longitude?: string;
  address?: string;

  playlistAssignments?: PlaylistAssignment[];
}