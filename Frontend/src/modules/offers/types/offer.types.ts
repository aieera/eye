export type Offer = {
  id: string;
  name: string;
  offerType: "percentage" | "flat";
  offerValue: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
};