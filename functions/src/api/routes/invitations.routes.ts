import {Router} from "express";
import * as invitationsController from "../controllers/invitations.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validate, validateParams} from "../../middleware/validation.middleware";
import {createInvitationSchema, resendInvitationSchema} from "../validators/invitations.validator";
import {eventParamsSchema, invitationParamsSchema} from "../validators/common.validator";

const router = Router();

router.get(
  "/:eventId/invitations",
  authenticate,
  validateParams(eventParamsSchema),
  invitationsController.listInvitations
);

router.post(
  "/:eventId/invitations",
  authenticate,
  validateParams(eventParamsSchema),
  validate(createInvitationSchema),
  invitationsController.createInvitation
);

router.post(
  "/:eventId/invitations/:invitationId/resend",
  authenticate,
  validateParams(invitationParamsSchema),
  validate(resendInvitationSchema),
  invitationsController.resendInvitation
);

export default router;
