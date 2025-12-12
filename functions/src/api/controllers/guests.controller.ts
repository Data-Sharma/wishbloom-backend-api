import {Request, Response, NextFunction} from "express";
import {GuestsService} from "../../services/guests.service";
import {EventsService} from "../../services/events.service";
import {sendCreated, sendNoContent, sendSuccess} from "../../utils/response.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

const ensureEventOwnership = async (req: Request, eventId: string) => {
  if (!req.user) {
    throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
  }

  const event = await EventsService.getEventById(eventId);
  if (event.hostId !== req.user.uid) {
    throw new AppError("Unauthorized to manage guests for this event", HTTP_STATUS.FORBIDDEN);
  }

  return event;
};

export const listGuests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    await ensureEventOwnership(req, eventId);
    const guests = await GuestsService.listGuests(
      eventId,
      req.query.status as string | undefined,
      req.query.search as string | undefined
    );
    sendSuccess(res, guests);
  } catch (error) {
    next(error);
  }
};

export const getGuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId, guestId} = req.params;
    await ensureEventOwnership(req, eventId);
    const guest = await GuestsService.getGuest(eventId, guestId);
    sendSuccess(res, guest);
  } catch (error) {
    next(error);
  }
};

export const addGuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    await ensureEventOwnership(req, eventId);
    const guest = await GuestsService.addGuest(eventId, req.body);
    sendCreated(res, guest, "Guest added successfully");
  } catch (error) {
    next(error);
  }
};

export const addGuestsBulk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    await ensureEventOwnership(req, eventId);
    const guests = await GuestsService.addGuestsBulk(eventId, req.body.guests || []);
    sendCreated(res, guests, "Guests added successfully");
  } catch (error) {
    next(error);
  }
};

export const updateGuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId, guestId} = req.params;
    await ensureEventOwnership(req, eventId);
    await GuestsService.updateGuest(eventId, guestId, req.body);
    const guest = await GuestsService.getGuest(eventId, guestId);
    sendSuccess(res, guest, "Guest updated successfully");
  } catch (error) {
    next(error);
  }
};

export const removeGuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId, guestId} = req.params;
    await ensureEventOwnership(req, eventId);
    await GuestsService.removeGuest(eventId, guestId);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

export const updateGuestRSVP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId, guestId} = req.params;
    await ensureEventOwnership(req, eventId);
    const guest = await GuestsService.updateGuestRSVP(eventId, guestId, req.body.rsvpStatus, req.body.message);
    sendSuccess(res, guest, "RSVP status updated");
  } catch (error) {
    next(error);
  }
};
