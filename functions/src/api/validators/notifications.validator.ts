import Joi from "joi";

export const sendNotificationSchema = Joi.object({
  userIds: Joi.array().items(Joi.string().trim()).min(1).required(),
  title: Joi.string().trim().min(3).max(200).required(),
  message: Joi.string().trim().min(1).max(2000).required(),
  data: Joi.object().optional(),
});

export const getUserNotificationsQuerySchema = Joi.object({
  isRead: Joi.string().valid("true", "false").optional(),
});

export const markReadParamsSchema = Joi.object({
  notificationId: Joi.string().required(),
});

export const updatePreferencesSchema = Joi.object({
  email: Joi.boolean().optional(),
  push: Joi.boolean().optional(),
  sms: Joi.boolean().optional(),
});
