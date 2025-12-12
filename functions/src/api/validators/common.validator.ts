import Joi from "joi";

export const userIdParamSchema = Joi.object({
  params: Joi.object({
    userId: Joi.string().trim().required(),
  }).required(),
});

export const vendorIdParamsSchema = Joi.object({
  params: Joi.object({
    vendorId: Joi.string().trim().required(),
  }).required(),
});

export const eventParamsSchema = Joi.object({
  eventId: Joi.string().trim().required(),
});

export const guestParamsSchema = eventParamsSchema.keys({
  guestId: Joi.string().trim().required(),
});

export const giftParamsSchema = eventParamsSchema.keys({
  giftId: Joi.string().trim().required(),
});

export const invitationParamsSchema = eventParamsSchema.keys({
  invitationId: Joi.string().trim().required(),
});

export const memoryParamsSchema = eventParamsSchema.keys({
  memoryId: Joi.string().trim().required(),
});

export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(25),
  status: Joi.string().trim().optional(),
  search: Joi.string().trim().optional(),
  category: Joi.string().trim().optional(),
});

export const paymentIntentParamsSchema = Joi.object({
  paymentIntentId: Joi.string().trim().required(),
});
