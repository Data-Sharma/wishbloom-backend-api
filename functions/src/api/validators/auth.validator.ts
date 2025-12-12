import Joi from "joi";
import {USER_ROLES} from "../../config/constants";

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
  displayName: Joi.string().min(2).max(100).optional(),
  role: Joi.string().valid(...Object.values(USER_ROLES)).default(USER_ROLES.HOST),
  phone: Joi.string().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  password: Joi.string().min(8).max(64).when('email', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
}).xor('email', 'phone'); // Either email OR phone, not both

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  oobCode: Joi.string().required(),
  newPassword: Joi.string().min(8).max(64).required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const otpSendSchema = Joi.object({
  phone: Joi.string().required(), // expectation: E.164 format (e.g. +918123456789)
});

export const phoneSignupSchema = Joi.object({
  phone: Joi.string().pattern(/^\+\d{10,15}$/).required(), // E.164 format
  password: Joi.string().min(8).max(64).required(),
  displayName: Joi.string().min(2).max(100).optional(),
  role: Joi.string().valid(...Object.values(USER_ROLES)).default(USER_ROLES.HOST),
  email: Joi.string().email().optional(),
}).xor('phone', 'email'); // Either phone OR email for signup

export const phoneLoginSchema = Joi.object({
  phone: Joi.string().pattern(/^\+\d{10,15}$/).required(),
  otp: Joi.string().length(6).required(), // 6-digit OTP
});

export const otpVerifySchema = Joi.object({
  phone: Joi.string().required(),
  code: Joi.string().required(),
});
