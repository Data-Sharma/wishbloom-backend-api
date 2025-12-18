import {Router} from "express";
import * as locationController from "../controllers/location.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validate} from "../../middleware/validation.middleware";
import {placeIdSchema} from "../validators/location.validator";

const router = Router();

/**
 * POST /api/events/location/resolve
 * Resolve Google Place ID to normalized location data (requires authentication)
 */
router.post(
  "/location/resolve",
  authenticate,
  validate(placeIdSchema),
  locationController.resolveEventLocation
);

export default router;
