export type DashboardStats = {
  activeScreens: number;
  totalOffers: number;
  totalProducts: number;
  activeScreensChange?: number;
  totalOffersChange?: number;
  totalProductsChange?: number;
};

export type Screen = {
  id: string;
  screenName: string;
  location: string;
  image: string;
  status: "online" | "offline" | "sync";
  playlistName?: string;
};

export type Offer = {
  id: string;
  name: string;
  offerType: "percentage" | "flat";
  offerValue: number;
  status: "active" | "inactive";
};

export type Activity = {
  id: string;
  title: string;
  subtitle: string;
  status: "active" | "scheduled" | "expiring";
};

export type ScreenStatus = {
  active: number;
  online: number;
  offline: number;
  syncErrors: number;
  expiredSoon: number;
};

export type DashboardData = {
  stats: DashboardStats;
  screens: Screen[];
  offers: Offer[];
  activities: Activity[];
  screenStatus: ScreenStatus;
};