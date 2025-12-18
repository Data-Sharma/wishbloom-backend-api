import {Router} from "express";
import * as analyticsController from "../controllers/analytics.controller";
import {validateParams} from "../../middleware/validation.middleware";
import {eventParamsSchema} from "../validators/common.validator";

const router = Router();

/**
 * GET /api/events/:eventId/engagement/trends
 * Get engagement trends over time
 * (More specific route must come first)
 */
router.get(
  "/:eventId/engagement/trends",
  validateParams(eventParamsSchema),
  analyticsController.getEngagementTrends
);

/**
 * GET /api/events/:eventId/analytics
 * Get event analytics (comprehensive engagement metrics)
 */
router.get(
  "/:eventId/analytics",
  validateParams(eventParamsSchema),
  analyticsController.getEventAnalytics
);

/**
 * GET /api/events/:eventId/engagement
 * Get guest engagement metrics for an event
 */
router.get(
  "/:eventId/engagement",
  validateParams(eventParamsSchema),
  analyticsController.getEventEngagementMetrics
);

export default router;

