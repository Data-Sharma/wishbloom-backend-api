import {Router} from "express";
import * as wishlistController from "../controllers/wishlist.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validate, validateParams} from "../../middleware/validation.middleware";
import {
  updateItemSchema,
  contributeSchema,
  purchaseSchema,
} from "../validators/wishlist.validator";
import Joi from "joi";

const router = Router();

// Item ID param validator
const itemIdParamSchema = Joi.object({
  params: Joi.object({
    itemId: Joi.string().trim().required(),
  }).required(),
});

// Item-level operations at /api/wishlist/items/:itemId
router.put(
  "/items/:itemId",
  authenticate,
  validateParams(itemIdParamSchema as any),
  validate(updateItemSchema),
  wishlistController.updateWishlistItem
);

router.delete(
  "/items/:itemId",
  authenticate,
  validateParams(itemIdParamSchema as any),
  wishlistController.deleteWishlistItem
);

router.post(
  "/items/:itemId/contribute",
  authenticate,
  validateParams(itemIdParamSchema as any),
  validate(contributeSchema),
  wishlistController.contributeToItem
);

router.post(
  "/items/:itemId/purchase",
  authenticate,
  validateParams(itemIdParamSchema as any),
  validate(purchaseSchema),
  wishlistController.purchaseItem
);

export default router;

