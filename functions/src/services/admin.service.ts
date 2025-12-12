import {FirestoreService} from "./database/firestore.service";
import {COLLECTIONS} from "../config/constants";
import {logger} from "../utils/logger.util";

export class AdminService {
  /** List users with optional pagination/filter */
  static async getAllUsers(query: Record<string, any>): Promise<any[]> {
    // Simple: allow ?role=admin etc. -- build filters based on query
    const filters: { field: string; operator: any; value: any }[] = [];
    if (query.role) {
      filters.push({field: "role", operator: "==", value: String(query.role)});
    }
    // Add other possible filters (isActive, email, etc.)
    if (query.isActive !== undefined) {
      const v = String(query.isActive) === "true";
      filters.push({field: "isActive", operator: "==", value: v});
    }

    const users = await FirestoreService.getDocuments(COLLECTIONS.USERS, filters);
    return users;
  }

  /** Suspend user by setting isActive=false (non-destructive). */
  static async suspendUser(userId: string, reason?: string): Promise<void> {
    // Add metadata if provided
    const payload: Record<string, any> = {isActive: false, updatedAt: new Date().toISOString()};
    if (reason) payload.suspensionReason = reason;
    await FirestoreService.updateDocument(COLLECTIONS.USERS, userId, payload);
    logger.info("User suspended", {userId, reason});
  }

  /**
   * Return content pending moderation.
   * This scans memory-like collections for moderationStatus === 'pending'.
   * If your app uses a different field name, adjust the `moderationField` accordingly.
   */
  static async getContentForModeration(): Promise<Record<string, any[]>> {
    const results: Record<string, any[]> = {};

    // collections to check — adjust names if needed
    const toCheck = [
      {col: COLLECTIONS.MEMORIES, name: "memories"},
      {col: COLLECTIONS.MEDIA, name: "media"},
      {col: COLLECTIONS.VENDOR_REVIEWS, name: "vendorReviews"},
    ];

    for (const entry of toCheck) {
      try {
        const items = await FirestoreService.getDocuments(entry.col, [
          {field: "moderationStatus", operator: "==", value: "pending"},
        ]);
        results[entry.name] = items || [];
      } catch (err) {
        // If collection or field doesn't exist yet, return empty list
        results[entry.name] = [];
      }
    }

    return results;
  }

  /** Mark vendor as verified (sets kyc_status = 'verified') */
  static async verifyVendor(vendorId: string, adminId?: string): Promise<any> {
    await FirestoreService.updateDocument(COLLECTIONS.VENDORS, vendorId, {
      kyc_status: "verified",
      verifiedBy: adminId || null,
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const vendor = await FirestoreService.getDocument(COLLECTIONS.VENDORS, vendorId);
    logger.info("Vendor verified", {vendorId, adminId});
    return vendor;
  }

  /** Simple analytics - counts for a few key collections */
  static async getAnalytics(): Promise<Record<string, number>> {
    const [
      users,
      events,
      vendors,
      bookings,
      transactions,
    ] = await Promise.all([
      FirestoreService.getDocuments(COLLECTIONS.USERS, []),
      FirestoreService.getDocuments(COLLECTIONS.EVENTS, []),
      FirestoreService.getDocuments(COLLECTIONS.VENDORS, []),
      FirestoreService.getDocuments(COLLECTIONS.VENDOR_BOOKINGS, []),
      FirestoreService.getDocuments(COLLECTIONS.TRANSACTIONS, []),
    ]);

    return {
      totalUsers: users?.length ?? 0,
      totalEvents: events?.length ?? 0,
      totalVendors: vendors?.length ?? 0,
      totalBookings: bookings?.length ?? 0,
      totalTransactions: transactions?.length ?? 0,
    };
  }
}
