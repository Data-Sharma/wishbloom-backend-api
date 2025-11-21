import Joi from "joi";

export const createInvitationSchema = Joi.object({
  guestName: Joi.string().trim().min(2).max(100).required(),
  guestEmail: Joi.string().email().required(),
  message: Joi.string().trim().max(500).optional(),
  rsvpLink: Joi.string().uri().optional(),
});

export const resendInvitationSchema = Joi.object({
  message: Joi.string().trim().max(500).optional(),
});
