import {Router} from "express";
import * as aiController from "../controllers/ai.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {aiLimiter} from "../../middleware/rateLimit.middleware";
import {validate} from "../../middleware/validation.middleware";
import {
  eventPlannerSchema,
  generateInvitationSchema,
  generateCaptionSchema,
  recommendThemeSchema,
  hostGiftRecommendationsSchema,
  guestGiftRecommendationsSchema,
} from "../validators/ai.validator";
import {uploadMemoryFile} from "../../middleware/uploadMemoryFile.middleware";

const router = Router();

// Apply AI rate limiting to all routes
router.use(aiLimiter);

/**
 * POST /api/v1/ai/event-planner
 */
router.post(
  "/event-planner",
  authenticate,
  validate(eventPlannerSchema),
  aiController.eventPlanner
);

/**
 * POST /api/v1/ai/generate-invitation
 */
router.post(
  "/generate-invitation",
  authenticate,
  validate(generateInvitationSchema),
  aiController.generateInvitation
);

/**
 * POST /api/v1/ai/recommend-theme
 */
router.post(
  "/recommend-theme",
  authenticate,
  validate(recommendThemeSchema),
  aiController.recommendTheme
);

/**
 * POST /api/v1/ai/generate-caption
 * Accepts multipart (image) or JSON
 */
router.post(
  "/generate-caption",
  authenticate,
  // allow multipart file or JSON: attach uploadMedia middleware to parse file
  uploadMemoryFile(), // will continue even if no file; it sets req.fileBuffer when present
  validate(generateCaptionSchema),
  aiController.generateCaption
);

/**
 * POST /api/v1/ai/generate-memory-caption
 * Accepts image or text
 */
router.post(
  "/generate-memory-caption",
  authenticate,
  uploadMemoryFile(),
  aiController.generateMemoryCaption
);

/**
 * POST /api/v1/ai/gift-recommendations/host
 */
router.post(
  "/gift-recommendations/host",
  authenticate,
  validate(hostGiftRecommendationsSchema),
  aiController.hostGiftRecommendations
);

/**
 * POST /api/v1/ai/gift-recommendations/guest
 */
router.post(
  "/gift-recommendations/guest",
  validate(guestGiftRecommendationsSchema),
  aiController.guestGiftRecommendations
);

export default router;
