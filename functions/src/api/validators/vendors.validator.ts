import Joi from "joi";

export const createVendorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  category: Joi.string().trim().required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().trim().optional(),
  website: Joi.string().uri().optional(),
  location: Joi.string().trim().optional(),
  notes: Joi.string().trim().max(500).optional(),
  rating: Joi.number().min(1).max(5).optional(),
});

export const updateVendorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).optional(),
  category: Joi.string().trim().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().trim().optional(),
  website: Joi.string().uri().optional(),
  location: Joi.string().trim().optional(),
  notes: Joi.string().trim().max(500).optional(),
  rating: Joi.number().min(1).max(5).optional(),
}).min(1);
