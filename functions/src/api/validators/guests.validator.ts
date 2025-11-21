import Joi from "joi";
import {RSVP_STATUS} from "../../config/constants";

const rsvpStatuses = Object.values(RSVP_STATUS);

export const createGuestSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().optional(),
  role: Joi.string().trim().valid("adult", "child", "vip").default("adult"),
  notes: Joi.string().trim().max(500).optional(),
  rsvpStatus: Joi.string()
    .valid(...rsvpStatuses)
    .default(RSVP_STATUS.PENDING),
  metadata: Joi.object().optional(),
});

export const updateGuestSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().trim().optional(),
  role: Joi.string().trim().valid("adult", "child", "vip").optional(),
  notes: Joi.string().trim().max(500).optional(),
  rsvpStatus: Joi.string().valid(...rsvpStatuses).optional(),
  metadata: Joi.object().optional(),
}).min(1);

export const rsvpUpdateSchema = Joi.object({
  rsvpStatus: Joi.string()
    .valid(...rsvpStatuses)
    .required(),
  message: Joi.string().trim().max(500).optional(),
});

export const guestQuerySchema = Joi.object({
  status: Joi.string().valid(...rsvpStatuses).optional(),
  search: Joi.string().trim().optional(),
});
