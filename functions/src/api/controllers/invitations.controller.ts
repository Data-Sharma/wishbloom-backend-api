import {Request, Response, NextFunction} from "express";
import {InvitationsService} from "../../services/invitations.service";
import {EventsService} from "../../services/events.service";
import {sendCreated, sendSuccess} from "../../utils/response.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

const ensureEventOwnership = async (req: Request, eventId: string) => {
  if (!req.user) {
    throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
  }

  const event = await EventsService.getEventById(eventId);
  if (event.hostId !== req.user.uid) {
    throw new AppError("Unauthorized to manage invitations for this event", HTTP_STATUS.FORBIDDEN);
  }

  return event;
};

export const listInvitations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    await ensureEventOwnership(req, eventId);
    const invitations = await InvitationsService.listInvitations(eventId);
    sendSuccess(res, invitations);
  } catch (error) {
    next(error);
  }
};

export const createInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    const event = await ensureEventOwnership(req, eventId);
    const invitation = await InvitationsService.createInvitation(event, req.body);
    sendCreated(res, invitation, "Invitation sent successfully");
  } catch (error) {
    next(error);
  }
};

export const resendInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId, invitationId} = req.params;
    const event = await ensureEventOwnership(req, eventId);
    const invitation = await InvitationsService.resendInvitation(event, invitationId, req.body.message);
    sendSuccess(res, invitation, "Invitation resent successfully");
  } catch (error) {
    next(error);
  }
};
