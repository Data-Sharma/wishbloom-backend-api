import Joi from "joi";

export const suspendUserSchema = Joi.object({
  reason: Joi.string().trim().max(500).optional(),
});
