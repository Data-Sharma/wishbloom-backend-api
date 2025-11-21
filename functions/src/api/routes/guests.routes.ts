import {Router} from "express";
import * as guestsController from "../controllers/guests.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validate, validateParams, validateQuery} from "../../middleware/validation.middleware";
import {
  createGuestSchema,
  updateGuestSchema,
  guestQuerySchema,
  rsvpUpdateSchema,
} from "../validators/guests.validator";
import {eventParamsSchema, guestParamsSchema} from "../validators/common.validator";

const router = Router();

router.get(
  "/:eventId/guests",
  authenticate,
  validateParams(eventParamsSchema),
  validateQuery(guestQuerySchema),
  guestsController.listGuests
);

router.post(
  "/:eventId/guests",
  authenticate,
  validateParams(eventParamsSchema),
  validate(createGuestSchema),
  guestsController.addGuest
);

router.put(
  "/:eventId/guests/:guestId",
  authenticate,
  validateParams(guestParamsSchema),
  validate(updateGuestSchema),
  guestsController.updateGuest
);

router.delete(
  "/:eventId/guests/:guestId",
  authenticate,
  validateParams(guestParamsSchema),
  guestsController.removeGuest
);

router.patch(
  "/:eventId/guests/:guestId/rsvp",
  authenticate,
  validateParams(guestParamsSchema),
  validate(rsvpUpdateSchema),
  guestsController.updateGuestRSVP
);

export default router;
