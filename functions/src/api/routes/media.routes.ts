import {Router} from "express";
import * as memoriesController from "../controllers/memories.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validateParams} from "../../middleware/validation.middleware";
import Joi from "joi";

// simple mediaId param validator
const mediaIdParamSchema = Joi.object({
  params: Joi.object({
    mediaId: Joi.string().trim().required(),
  }).required(),
});

const router = Router();

router.get("/media/:mediaId/download", validateParams(mediaIdParamSchema as any), memoriesController.downloadMedia);
router.delete("/media/:mediaId", authenticate, validateParams(mediaIdParamSchema as any), memoriesController.deleteMedia);

export default router;
