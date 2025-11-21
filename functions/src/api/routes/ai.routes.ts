import {Router} from "express";
import * as aiController from "../controllers/ai.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {aiLimiter} from "../../middleware/rateLimit.middleware";

const router = Router();

// Apply AI rate limiting to all routes
router.use(aiLimiter);

/**
 * POST /api/v1/ai/generate-theme
 * Generate event theme suggestions
 */
router.post(
  "/generate-theme",
  authenticate,
  aiController.generateTheme
);

/**
 * POST /api/v1/ai/generate-caption
 * Generate invitation caption
 */
router.post(
  "/generate-caption",
  authenticate,
  aiController.generateCaption
);

/**
 * POST /api/v1/ai/suggest-vendors
 * Suggest vendors for event
 */
router.post(
  "/suggest-vendors",
  authenticate,
  aiController.suggestVendors
);

/**
 * POST /api/v1/ai/generate-memory-caption
 * Generate caption for event photo
 */
router.post(
  "/generate-memory-caption",
  authenticate,
  aiController.generateMemoryCaption
);

/**
 * POST /api/v1/ai/generate-checklist
 * Generate event planning checklist
 */
router.post(
  "/generate-checklist",
  authenticate,
  aiController.generateChecklist
);

export default router;
