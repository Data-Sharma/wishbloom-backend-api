import {Router} from "express";
import * as invitationsController from "../controllers/invitations.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validate, validateParams} from "../../middleware/validation.middleware";
import {
  resendInvitationSchema,
} from "../validators/invitations.validator";
import {
  eventParamsSchema,
  invitationParamsSchema,
} from "../validators/common.validator";
import {
  generateInvitationSchema,
  createOrUpdateEventInvitationSchema,
  sendInvitationsSchema,
} from "../validators/invitations.full.validator";

const router = Router();

// Templates & AI generation
router.get("/templates", invitationsController.listTemplates);
router.post("/generate", validate(generateInvitationSchema), invitationsController.generateInvitation);

// Event-level invitation CRUD (host only)
router.post(
  "/events/:eventId/invitation",
  authenticate,
  validateParams(eventParamsSchema),
  validate(createOrUpdateEventInvitationSchema),
  invitationsController.createOrUpdateEventInvitation
);

router.get(
  "/events/:eventId/invitation",
  authenticate,
  validateParams(eventParamsSchema),
  invitationsController.getEventInvitation
);

// Send invitations to all guests (host only)
router.post(
  "/events/:eventId/invitation/send",
  authenticate,
  validateParams(eventParamsSchema),
  validate(sendInvitationsSchema),
  invitationsController.sendInvitationsToGuests
);

// Resend per-guest invitation
router.post(
  "/:eventId/invitations/:invitationId/resend",
  authenticate,
  validateParams(invitationParamsSchema),
  validate(resendInvitationSchema),
  invitationsController.resendInvitation
);

// Tracking pixel / click redirect / JSON track
router.get(
  "/:invitationId/track",
  validateParams(invitationParamsSchema),
  invitationsController.trackInvitation
);

// Click redirect that logs a click then forwards user to real RSVP page
router.get(
  "/:invitationId/redirect",
  validateParams(invitationParamsSchema),
  invitationsController.redirectAndTrack
);

export default router;
