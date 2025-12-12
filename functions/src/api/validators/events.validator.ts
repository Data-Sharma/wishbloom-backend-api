import Joi from "joi";

/**
 * Validation schema for creating an event
 */
export const createEventSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10).max(500),
  eventType: Joi.string()
    .required()
    .valid("birthday", "wedding", "anniversary", "graduation", "baby_shower", "retirement", "other"),
  eventDate: Joi.date().iso().required(),
  location: Joi.string().required().min(5).max(200),
  budget: Joi.number().optional().min(0).max(1000000),
  guestCount: Joi.number().optional().min(1).max(500),
}).required();

/**
 * Validation schema for updating event settings
 * Reuses the same shape as updateEventSchema
 */
export const eventSettingsSchema = Joi.object({
  title: Joi.string().optional().min(3).max(100),
  description: Joi.string().optional().min(10).max(500),
  eventDate: Joi.date().iso().optional(),
  location: Joi.string().optional().min(5).max(200),
  budget: Joi.number().optional().min(0).max(1000000),
  guestCount: Joi.number().optional().min(1).max(500),
  status: Joi.string().optional().valid("draft", "published", "ongoing", "completed", "cancelled"),
}).required();

/**
 * Validation schema for updating an event
 */
export const updateEventSchema = Joi.object({
  title: Joi.string().optional().min(3).max(100),
  description: Joi.string().optional().min(10).max(500),
  eventDate: Joi.date().iso().optional(),
  location: Joi.string().optional().min(5).max(200),
  budget: Joi.number().optional().min(0).max(1000000),
  guestCount: Joi.number().optional().min(1).max(500),
  status: Joi.string().optional().valid("draft", "published", "ongoing", "completed", "cancelled"),
}).required();

/**
 * Validation schema for event query parameters
 */
export const eventQuerySchema = Joi.object({
  status: Joi.string()
    .optional()
    .valid("draft", "published", "ongoing", "completed", "cancelled"),
  limit: Joi.number().optional().min(1).max(100),
  offset: Joi.number().optional().min(0),
}).required();

/**
 * Validation schema for event ID in params
 */
export const eventIdSchema = Joi.object({
  eventId: Joi.string().required().min(1),
}).required();
