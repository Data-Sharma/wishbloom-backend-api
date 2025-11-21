import Joi from "joi";
import {USER_ROLES} from "../../config/constants";

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
  displayName: Joi.string().min(2).max(100).optional(),
  role: Joi.string()
    .valid(...Object.values(USER_ROLES))
    .default(USER_ROLES.HOST),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
});

