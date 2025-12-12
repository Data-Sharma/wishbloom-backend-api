export interface Vendor {
  vendor_id: string;
  user_id: string;
  business_name: string;
  category: string;
  description: string;
  services: string[];
  portfolio: string[];
  rating: number;
  reviews_count: number;
  kyc_status: "pending" | "verified";
  location: string;
  created_at: string;
  updated_at: string;
}

export interface VendorQuote {
  quote_id: string;
  vendor_id: string;
  user_id: string;
  event_id: string;
  message: string;
  budget?: number;
  status: "pending" | "approved" | "declined";
  created_at: string;
}

export interface VendorBooking {
  booking_id: string;
  vendor_id: string;
  user_id: string;
  event_id: string;
  date: string;
  amount?: number;
  currency?: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled";
  payment_status: "unpaid" | "paid" | "refunded";
  created_at: string;
}

export interface VendorReview {
  review_id: string;
  vendor_id: string;
  user_id: string;
  event_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
}
