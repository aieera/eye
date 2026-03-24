export interface Offer {
  id: string;
  name: string;
  title?: string;
  description?: string;
  productId?: string;
  product?: {
    id: string;
    name: string;
    imageUrl?: string | null;
  };
  locationId?: string;
  location?: {
    id: string;
    name: string;
  };
  originalPrice?: number | null;
  offerPrice?: number | null;
  discountPercentage?: number | null;
  imageUrl?: string | null;
  source: "manual" | "oracle";
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OffersListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  productId?: string;
  locationId?: string;
  source?: "manual" | "oracle";
  status?: "active" | "expired" | "upcoming";
}

export interface CreateOfferPayload {
  name: string;
  title?: string;
  description?: string;
  productId?: string | null;
  locationId?: string | null;
  originalPrice?: number | null;
  offerPrice?: number | null;
  discountPercentage?: number | null;
  imageUrl?: string | null;
  source?: "manual" | "oracle";
  startDate: string;
  endDate: string;
}
