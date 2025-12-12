import {Request, Response, NextFunction} from "express";
import {RsvpService} from "../../services/rsvp.service";
import {EventsService} from "../../services/events.service";
import {sendSuccess} from "../../utils/response.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

/**
 * Guests do NOT require authentication to view invitation or RSVP.
 */

/** GET /api/invitations/:invitationId */
export const viewInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {invitationId} = req.params;
    const inv = await RsvpService.viewInvitation(invitationId);
    sendSuccess(res, inv);
  } catch (err) {
    next(err);
  }
};

/** POST /api/rsvp/:invitationId */
export const submitRsvp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {invitationId} = req.params;
    const {status, message} = req.body;

    const rsvp = await RsvpService.submitRsvp(invitationId, status, message);
    sendSuccess(res, rsvp, "RSVP submitted");
  } catch (err) {
    next(err);
  }
};

/** PUT /api/rsvp/:invitationId */
export const updateRsvp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {invitationId} = req.params;
    const {status, message} = req.body;

    const rsvp = await RsvpService.updateRsvp(invitationId, status, message);
    sendSuccess(res, rsvp, "RSVP updated");
  } catch (err) {
    next(err);
  }
};

/** GET /api/events/:eventId/rsvp/summary (host only) */
export const getRsvpSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {eventId} = req.params;
    if (!req.user) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

    const event = await EventsService.getEventById(eventId);
    if (event.hostId !== req.user.uid) {
      throw new AppError("Forbidden", HTTP_STATUS.FORBIDDEN);
    }

    const summary = await RsvpService.getRsvpSummary(eventId);
    sendSuccess(res, summary);
  } catch (err) {
    next(err);
  }
};
