import Joi from "joi";

export const updatePreferencesSchema = Joi.object({
  body: Joi.object({
    preferences: Joi.object({
      notifications: Joi.object({
        email: Joi.boolean()
          .messages({"boolean.base": "Email notifications must be a boolean"})
          .optional(),
        push: Joi.boolean()
          .messages({"boolean.base": "Push notifications must be a boolean"})
          .optional(),
      }).optional(),
      theme: Joi.string()
        .valid("light", "dark", "system")
        .messages({"any.only": "Theme must be one of: light, dark, system"})
        .optional(),
      language: Joi.string()
        .messages({"string.base": "Language must be a string"})
        .optional(),
    }).required(),
  }).required(),
});
