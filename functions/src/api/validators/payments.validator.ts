import Joi from "joi";

export const createPaymentIntentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().trim().length(3).default("usd"),
  metadata: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
});

export const refundPaymentSchema = Joi.object({
  amount: Joi.number().positive().optional(),
});
