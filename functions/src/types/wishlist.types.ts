export interface Wishlist {
  id: string;
  event_id: string;
  title?: string;
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  event_id: string;
  item_name: string;
  description?: string;
  price: number;
  product_link?: string;
  affiliate_link?: string;
  image_url?: string;
  target_amount?: number;
  collected_amount: number;
  contributors: any[];
  status: "available" | "funded" | "purchased";
  created_at: string;
  updated_at: string;
}
