import Joi from "joi";

export const eventPlannerSchema = Joi.object({
  eventType: Joi.string().trim().required(),
  eventDate: Joi.string().isoDate().optional().allow(null, ""),
  guestCount: Joi.number().integer().min(1).optional(),
  budget: Joi.number().positive().optional(),
  preferences: Joi.object().optional(),
  question: Joi.string().trim().optional(), // free-text for planner
});

export const generateInvitationSchema = Joi.object({
  eventTitle: Joi.string().trim().required(),
  eventType: Joi.string().trim().optional(),
  eventDate: Joi.string().optional().allow(null, ""),
  eventLocation: Joi.string().optional().allow(null, ""),
  tone: Joi.string().valid("formal", "casual", "fun", "romantic", "professional").optional(),
  extraDetails: Joi.string().max(2000).optional(),
  length: Joi.number().integer().min(20).max(1000).optional(),
});

export const generateCaptionSchema = Joi.object({
  imageDescription: Joi.string().trim().optional().allow("", null),
  eventTitle: Joi.string().trim().optional().allow("", null),
  length: Joi.number().integer().min(10).max(300).default(100),
  tone: Joi.string().valid("fun", "heartfelt", "witty", "simple").default("fun"),
});

export const recommendThemeSchema = Joi.object({
  eventType: Joi.string().trim().required(),
  mood: Joi.string().trim().optional(),
  colorPreferences: Joi.array().items(Joi.string().trim()).optional(),
  guestDemographics: Joi.object().optional(),
  budget: Joi.string().optional(),
});

export const hostGiftRecommendationsSchema = Joi.object({
  eventId: Joi.string().trim().required(),
  maxItems: Joi.number().integer().min(1).max(50).default(10),
  budgetMin: Joi.number().positive().optional(),
  budgetMax: Joi.number().positive().optional(),
  categories: Joi.array().items(Joi.string().trim()).optional(),
}).required();

export const guestGiftRecommendationsSchema = Joi.object({
  invitationId: Joi.string().trim().required(),
  maxItems: Joi.number().integer().min(1).max(50).default(10),
  budgetMin: Joi.number().positive().optional(),
  budgetMax: Joi.number().positive().optional(),
  categories: Joi.array().items(Joi.string().trim()).optional(),
}).required();
