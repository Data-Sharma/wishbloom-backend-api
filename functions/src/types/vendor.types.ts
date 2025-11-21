export type VendorCategory =
  | "catering"
  | "photography"
  | "music"
  | "decor"
  | "venue"
  | "planning"
  | "other";

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  rating?: number;
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  locations?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

