import Joi from "joi";

export const createMemorySchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).required(),
  description: Joi.string().trim().max(1000).optional(),
  mediaUrl: Joi.string().uri().optional(),
  mediaType: Joi.string().valid("image", "video", "note").default("note"),
  capturedAt: Joi.date().iso().optional(),
});

export const updateMemorySchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).optional(),
  description: Joi.string().trim().max(1000).optional(),
  mediaUrl: Joi.string().uri().optional(),
  mediaType: Joi.string().valid("image", "video", "note").optional(),
  capturedAt: Joi.date().iso().optional(),
}).min(1);
