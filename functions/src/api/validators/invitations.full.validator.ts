import Joi from "joi";

export const generateInvitationSchema = Joi.object({
  prompt: Joi.string().trim().optional(),
  eventId: Joi.string().trim().optional(),
  styleOptions: Joi.object().optional(),
  generateImage: Joi.boolean().default(false),
});

export const createOrUpdateEventInvitationSchema = Joi.object({
  templateId: Joi.string().trim().optional().allow(null),
  designData: Joi.object().optional().allow(null),
  content: Joi.string().trim().optional().allow(null),
  imageUrl: Joi.string().uri().optional().allow(null),
});

export const sendInvitationsSchema = Joi.object({
  messageOverride: Joi.string().trim().max(2000).optional(),
});
