import * as functions from "firebase-functions/v1";
import {FirestoreService} from "../services/database/firestore.service";
import {EmailService} from "../services/notification/email.service";
import {COLLECTIONS, EVENT_STATUS} from "../config/constants";
import {logger} from "../utils/logger.util";

/**
 * Scheduled function to send event reminders
 * Runs daily at 9 AM
 */
export const sendEventReminders = functions.pubsub
  .schedule("0 9 * * *")
  .timeZone("America/New_York")
  .onRun(async (context: functions.EventContext) => {
    try {
      logger.info("Starting event reminders job");

      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Get upcoming events (published status)
      const events = await FirestoreService.getDocuments(
        COLLECTIONS.EVENTS,
        [{field: "status", operator: "==", value: EVENT_STATUS.PUBLISHED}]
      );

      for (const event of events) {
        const eventDate = new Date(event.eventDate);

        // Check if event is 7 days away or 1 day away
        const isSevenDaysAway =
          eventDate.toDateString() === sevenDaysFromNow.toDateString();
        const isOneDayAway =
          eventDate.toDateString() === oneDayFromNow.toDateString();

        if (isSevenDaysAway || isOneDayAway) {
          const daysUntil = isSevenDaysAway ? 7 : 1;

          // Get all accepted guests
          const guests = await FirestoreService.getSubcollection(
            COLLECTIONS.EVENTS,
            event.id,
            COLLECTIONS.GUESTS,
            [{field: "rsvpStatus", operator: "==", value: "accepted"}]
          );

          // Send reminder to each guest
          for (const guest of guests) {
            await EmailService.sendEventReminder(
              guest.email,
              guest.name,
              event.title,
              event.eventDate,
              event.location,
              daysUntil
            );
          }

          logger.info("Event reminders sent", {
            eventId: event.id,
            guestCount: guests.length,
            daysUntil,
          });
        }
      }

      logger.info("Event reminders job completed");
    } catch (error) {
      logger.error("Error in sendEventReminders", error);
    }
  });

/**
 * Scheduled function to clean up expired events
 * Runs weekly on Sunday at midnight
 */
export const cleanupExpiredEvents = functions.pubsub
  .schedule("0 0 * * 0")
  .timeZone("America/New_York")
  .onRun(async (context: functions.EventContext) => {
    try {
      logger.info("Starting expired events cleanup");

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get completed events older than 30 days
      const events = await FirestoreService.getDocuments(
        COLLECTIONS.EVENTS,
        [{field: "status", operator: "==", value: EVENT_STATUS.COMPLETED}]
      );

      let archivedCount = 0;

      for (const event of events) {
        const eventDate = new Date(event.eventDate);

        if (eventDate < thirtyDaysAgo) {
          // Archive the event (update status)
          await FirestoreService.updateDocument(
            COLLECTIONS.EVENTS,
            event.id,
            {archived: true, archivedAt: new Date().toISOString()}
          );
          archivedCount++;
        }
      }

      logger.info("Expired events cleanup completed", {archivedCount});
    } catch (error) {
      logger.error("Error in cleanupExpiredEvents", error);
    }
  });
