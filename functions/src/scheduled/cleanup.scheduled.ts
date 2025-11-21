import * as functions from "firebase-functions/v1";
import {FirestoreService} from "../services/database/firestore.service";
import {COLLECTIONS, EVENT_STATUS} from "../config/constants";
import {logger} from "../utils/logger.util";

export const cleanupDraftEvents = functions.pubsub
  .schedule("0 4 * * *")
  .timeZone("America/New_York")
  .onRun(async () => {
    const drafts = await FirestoreService.getDocuments(COLLECTIONS.EVENTS, [
      {field: "status", operator: "==" as const, value: EVENT_STATUS.DRAFT},
    ]);

    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

    await Promise.all(
      drafts
        .filter((event) => new Date(event.updatedAt).getTime() < cutoff)
        .map((event) =>
          FirestoreService.updateDocument(COLLECTIONS.EVENTS, event.id, {
            archived: true,
            archivedAt: new Date().toISOString(),
          })
        )
    );

    logger.info("Draft event cleanup completed", {count: drafts.length});
  });

export const purgeOldNotifications = functions.pubsub
  .schedule("30 3 * * 0")
  .timeZone("America/New_York")
  .onRun(async () => {
    const notifications = await FirestoreService.getDocuments(COLLECTIONS.NOTIFICATIONS);
    const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;

    await Promise.all(
      notifications
        .filter((notification) => new Date(notification.createdAt).getTime() < cutoff)
        .map((notification) =>
          FirestoreService.deleteDocument(COLLECTIONS.NOTIFICATIONS, notification.id)
        )
    );

    logger.info("Old notifications purged");
  });
