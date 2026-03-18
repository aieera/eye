export type Brand = {
  id: string;
  name: string;
  logoUrl: string;
  status: "active" | "inactive";
  offer: string;
  offerStatus: "active" | "inactive";
};