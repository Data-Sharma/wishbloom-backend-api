import {Router} from "express";
import * as memoriesController from "../controllers/memories.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validate, validateParams} from "../../middleware/validation.middleware";
import {createMemorySchema, updateMemorySchema} from "../validators/memories.validator";
import {eventParamsSchema, memoryParamsSchema} from "../validators/common.validator";

const router = Router();

router.get(
  "/:eventId/memories",
  authenticate,
  validateParams(eventParamsSchema),
  memoriesController.listMemories
);

router.post(
  "/:eventId/memories",
  authenticate,
  validateParams(eventParamsSchema),
  validate(createMemorySchema),
  memoriesController.createMemory
);

router.put(
  "/:eventId/memories/:memoryId",
  authenticate,
  validateParams(memoryParamsSchema),
  validate(updateMemorySchema),
  memoriesController.updateMemory
);

router.delete(
  "/:eventId/memories/:memoryId",
  authenticate,
  validateParams(memoryParamsSchema),
  memoriesController.deleteMemory
);

export default router;
