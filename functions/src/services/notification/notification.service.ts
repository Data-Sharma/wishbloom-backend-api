import {FirestoreService} from "../database/firestore.service";
import {COLLECTIONS} from "../../config/constants";
import {logger} from "../../utils/logger.util";
import type {Notification, NotificationPreference} from "../../types/notification.types";

export class NotificationService {
  static async createNotification(payload: Notification): Promise<any> {
    const now = new Date().toISOString();
    const doc = {
      ...payload,
      isRead: payload.isRead ?? false,
      createdAt: now,
      updatedAt: now,
    };
    const created = await FirestoreService.createDocument(COLLECTIONS.NOTIFICATIONS, doc);
    logger.info("Notification created", {notificationId: created.id, userId: payload.userId});
    return created;
  }

  static async getUserNotifications(userId: string, query: Record<string, any> = {}): Promise<any[]> {
    const filters: { field: string; operator: any; value: any }[] = [
      {field: "userId", operator: "==", value: userId},
    ];

    if (query.isRead !== undefined) {
      filters.push({field: "isRead", operator: "==", value: query.isRead === "true"});
    }

    // Simple time-based pagination support: createdAt <= cursor
    const notifications = await FirestoreService.getDocuments(COLLECTIONS.NOTIFICATIONS, filters);
    // optionally sort descending by createdAt
    return (notifications || []).sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }

  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    // confirm ownership (small safety)
    const notif = await FirestoreService.getDocument(COLLECTIONS.NOTIFICATIONS, notificationId);
    if (!notif || notif.userId !== userId) {
      throw new Error("Notification not found or access denied");
    }
    await FirestoreService.updateDocument(COLLECTIONS.NOTIFICATIONS, notificationId, {
      isRead: true,
      updatedAt: new Date().toISOString(),
    });
    logger.info("Notification marked read", {notificationId, userId});
  }

  static async getPreferences(userId: string): Promise<NotificationPreference | null> {
    try {
      const prefs = await FirestoreService.getDocument(COLLECTIONS.NOTIFICATION_PREFERENCES, userId);
      return prefs as NotificationPreference;
    } catch (err) {
      return null;
    }
  }

  static async updatePreferences(userId: string, updates: Partial<NotificationPreference>): Promise<any> {
    const now = new Date().toISOString();
    // store preferences with document id = userId for easy lookup
    const payload = {
      ...updates,
      userId,
      updatedAt: now,
      createdAt: updates.createdAt ?? now,
    };
    // FirestoreService.createOrUpdateDocument is useful; if absent, try updateDocument then createDocument fallback
    try {
      await FirestoreService.updateDocument(COLLECTIONS.NOTIFICATION_PREFERENCES, userId, payload);
      return await FirestoreService.getDocument(COLLECTIONS.NOTIFICATION_PREFERENCES, userId);
    } catch (err) {
      // create if not exists
      const created = await FirestoreService.createDocument(COLLECTIONS.NOTIFICATION_PREFERENCES, payload, userId);
      return created;
    }
  }

  // system sender (admin-triggered broadcasting to list)
  static async sendSystemNotificationToUsers(userIds: string[], title: string, message: string, data?: Record<string, any>) {
    const now = new Date().toISOString();
    const payloads = userIds.map((uid) => ({
      userId: uid,
      type: "system" as const,
      title,
      message,
      data,
      isRead: false,
      createdAt: now,
      updatedAt: now,
    }));
    const results = [];
    for (const p of payloads) {
      const created = await FirestoreService.createDocument(COLLECTIONS.NOTIFICATIONS, p);
      results.push(created);
    }
    // Optionally call existing notification/transport service to send push/email
    // e.g. NotificationTransportService.sendPush(userIds, title, message, data)
    logger.info("System notifications created", {count: results.length});
    return results;
  }
}
