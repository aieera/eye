export interface Playlist {
  id: string;
  name: string;
  description?: string;
  locationId?: string;
  location?: { id: string; name: string };
  version: number;
  status: "draft" | "published";
  transitionType: "fade" | "slide" | "zoom" | "dissolve" | "none";
  transitionDurationMs: number;
  defaultDurationSec: number;
  createdBy?: { id: string; name: string };
  publishedAt?: string;
  isActive: boolean;
  items?: PlaylistItem[];
  _count?: { items: number };
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  itemType: "product" | "offer" | "custom" | "media";
  productId?: string;
  product?: {
    id: string;
    externalItemCode: string;
    name: string;
    imageUrl?: string;
    hasValidImage: boolean;
  };
  offerId?: string;
  offer?: {
    id: string;
    name: string;
    title?: string;
    originalPrice?: number;
    offerPrice?: number;
    discountPercentage?: number;
    imageUrl?: string;
  };
  mediaUrl?: string;
  customText?: string;
  customStyle?: {
    bgColor?: string;
    textColor?: string;
    fontSize?: number;
    fontWeight?: string;
    textAlign?: "left" | "center" | "right";
    bgImage?: string;
  };
  displayDurationSeconds: number;
  displayOrder: number;
  isActive: boolean;
}

export interface CreatePlaylistPayload {
  name: string;
  description?: string;
  locationId?: string | null;
  transitionType?: string;
  transitionDurationMs?: number;
  defaultDurationSec?: number;
}

export interface AddPlaylistItemPayload {
  itemType: "product" | "offer" | "custom" | "media";
  productId?: string | null;
  offerId?: string | null;
  mediaUrl?: string | null;
  customText?: string | null;
  customStyle?: Record<string, any> | null;
  displayDurationSeconds?: number;
  displayOrder: number;
}

export interface ReorderPayload {
  items: { id: string; displayOrder: number }[];
}

export interface PlaylistsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "draft" | "published";
  locationId?: string;
}
