export type Offer = {
  id: string;
  name: string;
  offerType: "percentage" | "flat";
  offerValue: number;
  offerStartDate: string;
  offerEndDate: string;
  status: "active" | "inactive";
};