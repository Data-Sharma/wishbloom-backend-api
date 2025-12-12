import {Request, Response, NextFunction} from "express";
import {AppError} from "../utils/error.util";
import {HTTP_STATUS, COLLECTIONS} from "../config/constants";
import {FirestoreService} from "../services/database/firestore.service";


export const ensureGuestOrHost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {eventId} = req.params;
    const user = req.user;

    if (!user) {
      throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
    }

    // Get the event
    const event = await FirestoreService.getDocument(COLLECTIONS.EVENTS, eventId);
    if (!event) {
      throw new AppError("Event not found", HTTP_STATUS.NOT_FOUND);
    }

    // Check if user is host
    if (event.hostId === user.uid) {
      return next();
    }

    // Check if user is an invited guest
    const guestQuery = await FirestoreService.getSubcollection(
      COLLECTIONS.EVENTS,
      eventId,
      "guests",
      [
        {field: "email", operator: "==", value: user.email?.toLowerCase()},
      ]
    );

    if (!guestQuery || guestQuery.length === 0) {
      throw new AppError("Not authorized to access this event's memories", HTTP_STATUS.FORBIDDEN);
    }

    next();
  } catch (error) {
    next(error);
  }
};
