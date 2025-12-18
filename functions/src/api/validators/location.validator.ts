import Joi from "joi";

/**
 * Schema for validating placeId in request body
 */
export const placeIdSchema = Joi.object({
  placeId: Joi
    .string()
    .required()
    .min(1)
    .max(255)
    .pattern(/^[A-Za-z0-9_-]+$/)
    .messages({
      "string.empty": "placeId is required",
      "string.min": "placeId is required",
      "string.max": "placeId too long",
      "string.pattern.base": "Invalid placeId format",
      "any.required": "placeId is required"
    })
});
