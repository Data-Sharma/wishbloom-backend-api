import Joi from "joi";

export const createMemorySchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  description: Joi.string().trim().max(2000).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  visibility: Joi.string().valid("private", "guests", "public").optional(),
});

export const updateMemorySchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  description: Joi.string().trim().max(2000).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  visibility: Joi.string().valid("private", "guests", "public").optional(),
}).min(1);
