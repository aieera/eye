export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: string;
}

export interface Screen extends BaseEntity {
  screenName: string;
  screenCode: string;
  location: string;

  status: "online" | "offline" | "sync";

  lastSync?: string;

  image?: string;

  latitude?: string;
  longitude?: string;
  address?: string;

  playlistAssignments?: PlaylistAssignment[];
}

export interface PlaylistAssignment {
  playlistId: string;
  playlistName: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}
