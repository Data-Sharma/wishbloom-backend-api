import * as functions from "firebase-functions/v1";
import {FirestoreService} from "../services/database/firestore.service";
import {COLLECTIONS} from "../config/constants";
import {logger} from "../utils/logger.util";

export const aggregateEventAnalytics = functions.pubsub
  .schedule("0 * * * *")
  .timeZone("America/New_York")
  .onRun(async () => {
    const events = await FirestoreService.getDocuments(COLLECTIONS.EVENTS);

    const summary = {
      totalEvents: events.length,
      published: events.filter((event) => event.status === "published").length,
      completed: events.filter((event) => event.status === "completed").length,
      updatedAt: new Date().toISOString(),
    };

    await FirestoreService.createDocument(COLLECTIONS.NOTIFICATIONS, summary, "analytics");
    logger.info("Event analytics aggregated");
  });
