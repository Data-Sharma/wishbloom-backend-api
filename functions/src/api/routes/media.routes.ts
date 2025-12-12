import {Router} from "express";
import * as memoriesController from "../controllers/memories.controller";
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

export default router;
