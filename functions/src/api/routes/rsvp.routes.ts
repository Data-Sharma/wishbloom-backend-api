import {Router} from "express";
import {
  viewInvitation,
  submitRsvp,
  updateRsvp,
  getRsvpSummary,
} from "../controllers/rsvp.controller";
import {validate, validateParams} from "../../middleware/validation.middleware";
import {submitRsvpSchema} from "../validators/rsvp.validator";
import {authenticate} from "../../middleware/auth.middleware";
import {invitationParamsSchema, eventParamsSchema} from "../validators/common.validator";

const router = Router();

// Guest-facing (no authentication required)
router.get(
  "/invitations/:invitationId",
  validateParams(invitationParamsSchema),
  viewInvitation
);

router.post(
  "/rsvp/:invitationId",
  validateParams(invitationParamsSchema),
  validate(submitRsvpSchema),
  submitRsvp
);

router.put(
  "/rsvp/:invitationId",
  validateParams(invitationParamsSchema),
  validate(submitRsvpSchema),
  updateRsvp
);

// Host summary (requires auth)
router.get(
  "/events/:eventId/rsvp/summary",
  authenticate,
  validateParams(eventParamsSchema),
  getRsvpSummary
);

export default router;
