export interface VariantMedia {
  id: string;
  media_type: string;
  media_url: string;
  is_primary: boolean;
}

export interface Variant {
  id: string;
  sku: string;
  attributes: {
    color: string;
    storage: string;
  };
  price: number;
  is_default: boolean;
  variant_media: VariantMedia[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  variants: Variant[];
}