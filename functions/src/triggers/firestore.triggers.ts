import * as functions from "firebase-functions/v1";
import {EmailService} from "../services/notification/email.service";
import {FirestoreService} from "../services/database/firestore.service";
import {COLLECTIONS} from "../config/constants";
import {logger} from "../utils/logger.util";

/**
 * Trigger when a new guest is added to an event
 */
export const onGuestCreated = functions.firestore
  .document(`${COLLECTIONS.EVENTS}/{eventId}/${COLLECTIONS.GUESTS}/{guestId}`)
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    try {
      const guest = snap.data();
      if (!guest) {
        logger.warn("Guest snapshot missing data", {guestId: snap.id, eventId: context.params.eventId});
        return;
      }
      const {eventId} = context.params;

      // Get event details
      const event = await FirestoreService.getDocument(COLLECTIONS.EVENTS, eventId);

      // Send invitation email
      await EmailService.sendInvitation({
        guestEmail: guest.email,
        guestName: guest.name,
        eventTitle: event.title,
        eventDate: event.eventDate,
        eventLocation: event.location,
        hostName: event.hostName || "The Host",
        rsvpLink: `https://wishbloom.com/events/${eventId}/rsvp/${snap.id}`,
      });

      logger.info("Guest invitation sent", {guestId: snap.id, eventId});
    } catch (error) {
      logger.error("Error in onGuestCreated trigger", error);
    }
  });

/**
 * Trigger when guest RSVP status is updated
 */
export const onRSVPUpdated = functions.firestore
  .document(`${COLLECTIONS.EVENTS}/{eventId}/${COLLECTIONS.GUESTS}/{guestId}`)
  .onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    try {
      const before = change.before.data();
      const after = change.after.data();
      if (!before || !after) {
        logger.warn("RSVP update missing snapshot data", {
          guestId: change.after.id,
          eventId: context.params.eventId,
        });
        return;
      }
      const {eventId} = context.params;

      // Check if RSVP status changed
      if (before.rsvpStatus !== after.rsvpStatus) {
        const event = await FirestoreService.getDocument(COLLECTIONS.EVENTS, eventId);

        // Send RSVP confirmation email
        await EmailService.sendRSVPConfirmation(
          after.email,
          after.name,
          event.title,
          after.rsvpStatus
        );

        // Update guest count in event if accepted
        if (after.rsvpStatus === "accepted" && before.rsvpStatus !== "accepted") {
          await FirestoreService.incrementField(COLLECTIONS.EVENTS, eventId, "guestAcceptedCount", 1);
        } else if (before.rsvpStatus === "accepted" && after.rsvpStatus !== "accepted") {
          await FirestoreService.incrementField(COLLECTIONS.EVENTS, eventId, "guestAcceptedCount", -1);
        }

        logger.info("RSVP updated", {guestId: change.after.id, eventId, status: after.rsvpStatus});
      }
    } catch (error) {
      logger.error("Error in onRSVPUpdated trigger", error);
    }
  });

/**
 * Trigger when a gift is purchased
 */
export const onGiftPurchased = functions.firestore
  .document(`${COLLECTIONS.EVENTS}/{eventId}/${COLLECTIONS.GIFTS}/{giftId}`)
  .onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    try {
      const before = change.before.data();
      const after = change.after.data();
      if (!before || !after) {
        logger.warn("Gift purchase update missing snapshot data", {
          giftId: change.after.id,
          eventId: context.params.eventId,
        });
        return;
      }
      const {eventId} = context.params;

      // Check if gift status changed to purchased
      if (before.status !== "purchased" && after.status === "purchased") {
        const event = await FirestoreService.getDocument(COLLECTIONS.EVENTS, eventId);

        // Send confirmation to purchaser
        if (after.purchasedBy) {
          await EmailService.sendGiftConfirmation(
            after.purchaserEmail,
            after.purchaserName,
            after.name,
            event.title,
            after.price
          );
        }

        // Increment gift count in event
        await FirestoreService.incrementField(COLLECTIONS.EVENTS, eventId, "giftCount", 1);

        logger.info("Gift purchased", {giftId: change.after.id, eventId});
      }
    } catch (error) {
      logger.error("Error in onGiftPurchased trigger", error);
    }
  });
