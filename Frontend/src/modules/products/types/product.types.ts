export interface Product {
  id: string;
  externalItemCode: string;
  name: string;
  shortName?: string;
  description?: string;
  dept?: string;
  classCode?: string;
  subclass?: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  status: string;
  hasValidImage: boolean;
  imageUrl?: string | null;
  videoUrl?: string | null;
  fallbackImageUrl?: string | null;
  uom?: string;
  isSynced: boolean;
  isActive: boolean;
  prices?: ProductPrice[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductPrice {
  id: string;
  productId: string;
  locationId: string;
  location?: { id: string; name: string };
  unitRetail: number;
  sellingUnitRetail?: number;
  sellingUom?: string;
  currency: string;
  effectiveDate?: string;
}

export interface ProductsListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: string;
  hasImage?: boolean;
  locationId?: string;
  isActive?: boolean;
}

export interface CreateProductPayload {
  externalItemCode: string;
  name: string;
  shortName?: string;
  description?: string;
  categoryId?: string;
  uom?: string;
}

export interface UpdatePricesPayload {
  prices: {
    locationId: string;
    unitRetail: number;
    sellingUnitRetail?: number;
    sellingUom?: string;
    currency?: string;
  }[];
}
