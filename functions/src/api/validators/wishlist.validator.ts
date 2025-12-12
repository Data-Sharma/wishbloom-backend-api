import Joi from "joi";

export const createWishlistSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  description: Joi.string().trim().max(1000).optional(),
});

export const addItemSchema = Joi.object({
  item_name: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().max(1000).optional(),
  price: Joi.number().precision(2).min(0).required(),
  product_link: Joi.string().uri().optional(),
  affiliate_link: Joi.string().uri().optional(),
  image_url: Joi.string().uri().optional(),
  target_amount: Joi.number().precision(2).min(0).optional(),
});

export const updateItemSchema = Joi.object({
  item_name: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().trim().max(1000).optional(),
  price: Joi.number().precision(2).min(0).optional(),
  product_link: Joi.string().uri().optional(),
  affiliate_link: Joi.string().uri().optional(),
  image_url: Joi.string().uri().optional(),
  target_amount: Joi.number().precision(2).min(0).optional(),
  status: Joi.string().valid("available", "funded", "purchased").optional(),
}).min(1);

export const contributeSchema = Joi.object({
  amount: Joi.number().precision(2).min(0.01).required(),
  message: Joi.string().trim().max(500).optional(),
});

export const purchaseSchema = Joi.object({
  purchaserName: Joi.string().trim().required(),
  purchaserEmail: Joi.string().email().optional(),
});
