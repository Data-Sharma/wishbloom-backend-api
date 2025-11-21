import {Request, Response, NextFunction} from "express";
import {EventsService} from "../../services/events.service";
import {sendSuccess, sendCreated, sendNoContent} from "../../utils/response.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

/**
 * Create a new event
 */
export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    const event = await EventsService.createEvent(req.user.uid, req.body);
    sendCreated(res, event, "Event created successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get all user's events
 */
export const getUserEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    const status = req.query.status as string | undefined;
    const events = await EventsService.getUserEvents(req.user.uid, status);
    sendSuccess(res, events);
  } catch (error) {
    next(error);
  }
};

/**
 * Get event by ID
 */
export const getEventById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {eventId} = req.params;
    const event = await EventsService.getEventById(eventId);
    sendSuccess(res, event);
  } catch (error) {
    next(error);
  }
};

/**
 * Update event
 */
export const updateEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    const {eventId} = req.params;

    // Verify user owns the event
    const event = await EventsService.getEventById(eventId);
    if (event.hostId !== req.user.uid) {
      throw new AppError("Unauthorized to update this event", HTTP_STATUS.FORBIDDEN);
    }

    await EventsService.updateEvent(eventId, req.body);
    const updatedEvent = await EventsService.getEventById(eventId);
    sendSuccess(res, updatedEvent, "Event updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Delete event
 */
export const deleteEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    const {eventId} = req.params;

    // Verify user owns the event
    const event = await EventsService.getEventById(eventId);
    if (event.hostId !== req.user.uid) {
      throw new AppError("Unauthorized to delete this event", HTTP_STATUS.FORBIDDEN);
    }

    await EventsService.deleteEvent(eventId);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Get event statistics
 */
export const getEventStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {eventId} = req.params;
    const stats = await EventsService.getEventStats(eventId);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};
