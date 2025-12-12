import Joi from "joi";

export const vendorFilterQuerySchema = Joi.object({
  category: Joi.string().trim().optional(),
  search: Joi.string().trim().optional(),
  minRating: Joi.number().min(1).max(5).optional(),
});

export const vendorIdParamSchema = Joi.object({
  vendorId: Joi.string().required(),
});

// request quote
export const requestQuoteSchema = Joi.object({
  eventId: Joi.string().required(),
  message: Joi.string().min(5).max(1000).required(),
  budget: Joi.number().optional(),
});

// booking vendor
export const bookVendorSchema = Joi.object({
  eventId: Joi.string().required(),
  date: Joi.string().isoDate().required(),
  amount: Joi.number().optional(),
  currency: Joi.string().optional().default("INR"),
  notes: Joi.string().max(500).optional(),
});

// review vendor
export const reviewVendorSchema = Joi.object({
  eventId: Joi.string().optional(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(500).optional(),
});
