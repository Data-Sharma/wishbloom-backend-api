import Joi from "joi";
import {GIFT_STATUS} from "../../config/constants";

const giftStatuses = Object.values(GIFT_STATUS);

export const createGiftSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().max(500).optional(),
  price: Joi.number().precision(2).min(0).required(),
  link: Joi.string().uri().optional(),
  imageUrl: Joi.string().uri().optional(),
  status: Joi.string().valid(...giftStatuses).default(GIFT_STATUS.AVAILABLE),
});

export const updateGiftSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).optional(),
  description: Joi.string().trim().max(500).optional(),
  price: Joi.number().precision(2).min(0).optional(),
  link: Joi.string().uri().optional(),
  imageUrl: Joi.string().uri().optional(),
  status: Joi.string().valid(...giftStatuses).optional(),
}).min(1);

export const giftStatusSchema = Joi.object({
  status: Joi.string().valid(...giftStatuses).required(),
  purchaserName: Joi.string().trim().optional(),
  purchaserEmail: Joi.string().email().optional(),
});
