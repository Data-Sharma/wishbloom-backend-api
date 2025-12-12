import {FirestoreService} from "./database/firestore.service";
import {COLLECTIONS} from "../config/constants";
import {logger} from "../utils/logger.util";

export class VendorsService {
  // -------------------- VENDORS ---------------------
  static async getVendors(query: any): Promise<any[]> {
    const filters: any[] = [];

    if (query.category) {
      filters.push({field: "category", operator: "==", value: query.category});
    }
    if (query.minRating) {
      filters.push({field: "rating", operator: ">=", value: Number(query.minRating)});
    }

    let vendors = await FirestoreService.getDocuments(COLLECTIONS.VENDORS, filters);

    if (query.search) {
      const s = query.search.toLowerCase();
      vendors = vendors.filter((v: any) =>
        (v.business_name?.toLowerCase().includes(s)) ||
        (v.category?.toLowerCase().includes(s))
      );
    }

    return vendors;
  }

  static async getVendorById(vendorId: string): Promise<any> {
    return await FirestoreService.getDocument(COLLECTIONS.VENDORS, vendorId);
  }

  // -------------------- QUOTES ---------------------
  static async requestQuote(vendorId: string, userId: string, data: any) {
    const payload = {
      vendor_id: vendorId,
      user_id: userId,
      event_id: data.eventId,
      message: data.message,
      budget: data.budget || null,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const saved = await FirestoreService.createDocument(COLLECTIONS.VENDOR_QUOTES, payload);
    logger.info("Vendor quote created", {id: saved.id, vendorId, userId});
    return saved;
  }

  static async getQuotesForUser(userId: string) {
    return await FirestoreService.getDocuments(COLLECTIONS.VENDOR_QUOTES, [
      {field: "user_id", operator: "==", value: userId},
    ]);
  }

  // -------------------- BOOKINGS ---------------------
  static async bookVendor(vendorId: string, userId: string, data: any) {
    const payload = {
      vendor_id: vendorId,
      user_id: userId,
      event_id: data.eventId,
      date: data.date,
      amount: data.amount || null,
      currency: data.currency || "INR",
      notes: data.notes || null,
      status: "pending",
      payment_status: "unpaid",
      created_at: new Date().toISOString(),
    };

    const saved = await FirestoreService.createDocument(COLLECTIONS.VENDOR_BOOKINGS, payload);
    logger.info("Vendor booking created", {id: saved.id, vendorId, userId});
    return saved;
  }

  // -------------------- REVIEWS ---------------------
  static async reviewVendor(vendorId: string, userId: string, data: any) {
    const payload = {
      vendor_id: vendorId,
      user_id: userId,
      event_id: data.eventId || null,
      rating: data.rating,
      comment: data.comment || null,
      created_at: new Date().toISOString(),
    };

    const saved = await FirestoreService.createDocument(COLLECTIONS.VENDOR_REVIEWS, payload);

    // update vendor rating summary (simple approach)
    const reviews = await FirestoreService.getDocuments(COLLECTIONS.VENDOR_REVIEWS, [
      {field: "vendor_id", operator: "==", value: vendorId},
    ]);

    const avg =
      reviews.reduce((a: number, r: any) => a + (r.rating || 0), 0) / (reviews.length || 1);

    await FirestoreService.updateDocument(COLLECTIONS.VENDORS, vendorId, {
      rating: avg,
      reviews_count: reviews.length,
    });

    logger.info("Vendor review added", {vendorId, userId});
    return saved;
  }

  // -------------------- CATEGORIES ---------------------
  static getVendorCategories() {
    return [
      "catering",
      "photography",
      "music",
      "decor",
      "venue",
      "planning",
      "transport",
      "florist",
      "cake",
      "makeup",
      "other",
    ];
  }
}
