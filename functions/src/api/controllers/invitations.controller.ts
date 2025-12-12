import {Request, Response, NextFunction} from "express";
import {InvitationsService} from "../../services/invitations.service";
import {EventsService} from "../../services/events.service";
import {sendCreated, sendSuccess} from "../../utils/response.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS, REDIRECT_WHITELIST} from "../../config/constants";
import {logger} from "../../utils/logger.util";
/**
 * Ensure the request user is the event host
 */
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

/** GET /api/invitations/templates */
export const listTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const templates = await InvitationsService.listTemplates();
    sendSuccess(res, templates);
  } catch (error) {
    next(error);
  }
};

/** POST /api/invitations/generate */
export const generateInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = req.body;
    const generated = await InvitationsService.generateInvitation(payload);
    sendSuccess(res, generated, "Invitation generated");
  } catch (error) {
    next(error);
  }
};

/** POST /api/events/:eventId/invitation */
export const createOrUpdateEventInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    const event = await ensureEventOwnership(req, eventId);
    const invitation = await InvitationsService.createOrUpdateEventInvitation(event, req.body);
    sendCreated(res, invitation, "Event invitation created/updated");
  } catch (error) {
    next(error);
  }
};

/** GET /api/events/:eventId/invitation */
export const getEventInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    const invitation = await InvitationsService.getEventInvitation(eventId);
    sendSuccess(res, invitation);
  } catch (error) {
    next(error);
  }
};

/** POST /api/events/:eventId/invitation/send */
export const sendInvitationsToGuests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    const event = await ensureEventOwnership(req, eventId);
    const {messageOverride} = req.body as { messageOverride?: string };
    const report = await InvitationsService.sendInvitationsToGuests(event, {messageOverride});
    sendSuccess(res, report, "Invitations queued/sent");
  } catch (error) {
    next(error);
  }
};

/** POST /api/:eventId/invitations/:invitationId/resend */
export const resendInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId, invitationId} = req.params;
    const event = await ensureEventOwnership(req, eventId);
    const {message} = req.body as {message?: string};
    const result = await InvitationsService.resendInvitation(event, invitationId, message);
    sendSuccess(res, result, "Invitation resent");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/invitations/:invitationId/track?action=open|delivered
 * - For action=open returns a 1x1 GIF to be used as tracking pixel
 * - For other actions returns JSON ok.
 */
export const trackInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {invitationId} = req.params;
    const action = (req.query.action as string) || (req.body && (req.body.action as string));
    if (!action) throw new AppError("action is required", HTTP_STATUS.BAD_REQUEST);

    const meta = {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      referer: req.headers.referer || null,
    };

    // record the track
    const result = await InvitationsService.trackInvitation(invitationId, action as "opened" | "clicked" | "delivered", meta);

    if (action === "open" || action === "opened") {
      // Return a 1x1 transparent GIF
      const gif = Buffer.from("R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==", "base64");
      res.setHeader("Content-Type", "image/gif");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.status(200).send(gif);
      return;
    }

    // non-pixel tracking
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/invitations/:invitationId/redirect?guestEmail=...
 * - Marks a click event and redirects user to the actual RSVP page.
 * - If no guestEmail provided, still tracks click for the invitation doc.
 */
export const redirectAndTrack = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {invitationId} = req.params;
    const guestEmail = req.query.guestEmail as string | undefined;

    const invitation = await InvitationsService.getInvitationById(invitationId);
    let redirectTo = invitation?.rsvpLink;

    if (!redirectTo) {
      // fallback to a safe default
      const frontend = process.env.FRONTEND_URL || "https://wishbloom.com";
      redirectTo = `${frontend}/rsvp?invitationId=${invitationId}`;
    }

    // -------------------------------------------
    // 🔒 STEP 1 — Security: Validate redirect host
    // -------------------------------------------
    try {
      const redirectURL = new URL(redirectTo);
      const redirectOrigin = redirectURL.origin.toLowerCase();

      const safe = REDIRECT_WHITELIST.some((allowed) =>
        allowed.toLowerCase() === redirectOrigin
      );

      if (!safe) {
        // If the target is not safe, override to frontend RSVP page
        const fallbackFrontend = process.env.FRONTEND_URL || "https://wishbloom.com";
        logger.warn("Unsafe redirect blocked. Using fallback page.", {
          attemptedOrigin: redirectOrigin,
          safeOrigins: REDIRECT_WHITELIST,
        });

        redirectTo = `${fallbackFrontend}/rsvp?invitationId=${invitationId}`;
      }
    } catch (err) {
      const fallbackFrontend = process.env.FRONTEND_URL || "https://wishbloom.com";
      logger.warn("Invalid redirect URL structure blocked", {redirectTo});
      redirectTo = `${fallbackFrontend}/rsvp?invitationId=${invitationId}`;
    }

    // -------------------------------------------
    // 🔒 STEP 2 — Track click before redirecting
    // -------------------------------------------
    const meta = {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      guestEmail: guestEmail || null,
    };

    await InvitationsService.trackInvitation(invitationId, "clicked", meta);

    return res.redirect(302, redirectTo);
  } catch (error) {
    next(error);
  }
};
