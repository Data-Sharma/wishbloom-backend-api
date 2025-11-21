import {Router} from "express";
import * as eventsController from "../controllers/events.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validate, validateParams, validateQuery} from "../../middleware/validation.middleware";
import {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
  eventIdSchema,
} from "../validators/events.validator";

const router = Router();

/**
 * POST /api/v1/events
 * Create a new event (requires authentication)
 */
router.post(
  "/",
  authenticate,
  validate(createEventSchema),
  eventsController.createEvent
);

/**
 * GET /api/v1/events
 * Get all user's events (requires authentication)
 */
router.get(
  "/",
  authenticate,
  validateQuery(eventQuerySchema),
  eventsController.getUserEvents
);

/**
 * GET /api/v1/events/:eventId
 * Get event details by ID
 */
router.get(
  "/:eventId",
  validateParams(eventIdSchema),
  eventsController.getEventById
);

/**
 * PUT /api/v1/events/:eventId
 * Update event (requires authentication and ownership)
 */
router.put(
  "/:eventId",
  authenticate,
  validateParams(eventIdSchema),
  validate(updateEventSchema),
  eventsController.updateEvent
);

/**
 * DELETE /api/v1/events/:eventId
 * Delete event (requires authentication and ownership)
 */
router.delete(
  "/:eventId",
  authenticate,
  validateParams(eventIdSchema),
  eventsController.deleteEvent
);

/**
 * GET /api/v1/events/:eventId/stats
 * Get event statistics
 */
router.get(
  "/:eventId/stats",
  validateParams(eventIdSchema),
  eventsController.getEventStats
);

export default router;
