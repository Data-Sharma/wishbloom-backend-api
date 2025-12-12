import {Router} from "express";
import * as memoriesController from "../controllers/memories.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validate, validateParams} from "../../middleware/validation.middleware";
import {createMemorySchema, updateMemorySchema} from "../validators/memories.validator";
import {eventParamsSchema, memoryParamsSchema} from "../validators/common.validator";
import {ensureGuestOrHost} from "../../middlewares/ensureGuestOrHost";
import {ensureMemoryOwnerOrHost} from "../../middlewares/ensureMemoryOwnerOrHost";
import {uploadMemoryFile} from "../../middleware/uploadMemoryFile.middleware";

const router = Router();

// All memory routes require user to be authenticated and either a host or guest of the event
router.use(
  "/:eventId/memories",
  authenticate,
  validateParams(eventParamsSchema),
  ensureGuestOrHost
);

router.get("/:eventId/memories", memoriesController.listMemories);

// Upload (multipart). Note: middleware allows metadata-only requests to pass.
router.post("/:eventId/memories/upload", uploadMemoryFile("file"), memoriesController.uploadMemoryFile);

// metadata-only create (notes)
router.post("/:eventId/memories", validate(createMemorySchema), memoriesController.createMemory);

// memory ownership required for updates/deletes
router.put(
  "/:eventId/memories/:memoryId",
  validateParams(memoryParamsSchema),
  validate(updateMemorySchema),
  ensureMemoryOwnerOrHost,
  memoriesController.updateMemory
);

router.delete(
  "/:eventId/memories/:memoryId",
  validateParams(memoryParamsSchema),
  ensureMemoryOwnerOrHost,
  memoriesController.deleteMemory
);

export default router;
