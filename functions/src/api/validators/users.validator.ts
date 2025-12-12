import Joi from "joi";

export const userIdParamSchema = Joi.object({
  params: Joi.object({
    userId: Joi.string().required().messages({
      "string.empty": "User ID is required",
      "any.required": "User ID is required",
    }),
  }).required(),
});

export const updateUserProfileSchema = Joi.object({
  body: Joi.object({
    displayName: Joi.string()
      .min(2)
      .max(50)
      .messages({
        "string.min": "Display name must be at least 2 characters long",
        "string.max": "Display name cannot exceed 50 characters",
      })
      .optional(),
    bio: Joi.string()
      .max(500)
      .messages({
        "string.max": "Bio cannot exceed 500 characters",
      })
      .optional(),
    phoneNumber: Joi.string()
      .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)
      .message("Invalid phone number format")
      .optional(),
  }).required(),
});
