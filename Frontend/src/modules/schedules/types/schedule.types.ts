export interface Schedule {
  id: string;
  screenId: string;
  screen?: {
    id: string;
    screenName: string;
    screenCode: string;
  };
  playlistId: string;
  playlist?: {
    id: string;
    name: string;
    status: string;
    version: number;
  };
  startDate: string;
  endDate?: string | null;
  startTime: string;
  endTime: string;
  recurrenceType: "once" | "daily" | "weekly";
  daysOfWeek?: number[] | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchedulePayload {
  screenId: string;
  playlistId: string;
  startDate: string;
  endDate?: string | null;
  startTime: string;
  endTime: string;
  recurrenceType: "once" | "daily" | "weekly";
  daysOfWeek?: number[];
  priority?: number;
}

export interface SchedulesListParams {
  page?: number;
  limit?: number;
  screenId?: string;
  playlistId?: string;
  isActive?: boolean;
}

export interface CalendarDay {
  date: string;
  schedules: {
    id: string;
    playlistName: string;
    playlistId: string;
    startTime: string;
    endTime: string;
    priority: number;
    recurrenceType: string;
  }[];
}
