import {Router} from "express";
import * as wishlistController from "../controllers/wishlist.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validate, validateParams} from "../../middleware/validation.middleware";
import {
  createWishlistSchema,
  addItemSchema,
  updateItemSchema,
  contributeSchema,
  purchaseSchema,
} from "../validators/wishlist.validator";
import {eventParamsSchema} from "../validators/common.validator";

const router = Router();

// Wishlist per event
router.get("/:eventId/wishlist", validateParams(eventParamsSchema), wishlistController.getWishlist);
router.post("/:eventId/wishlist", authenticate, validateParams(eventParamsSchema), validate(createWishlistSchema), wishlistController.createWishlist);

// Items (event-based add)
router.post("/:eventId/wishlist/items", authenticate, validateParams(eventParamsSchema), validate(addItemSchema), wishlistController.addWishlistItem);

// Item-level by itemId
router.put("/items/:itemId", authenticate, validate(updateItemSchema), wishlistController.updateWishlistItem);
router.delete("/items/:itemId", authenticate, wishlistController.deleteWishlistItem);

// Contribute
router.post("/items/:itemId/contribute", authenticate, validate(contributeSchema), wishlistController.contributeToItem);

// Purchase via affiliate (marks purchased and records purchaser)
router.post("/items/:itemId/purchase", authenticate, validate(purchaseSchema), wishlistController.purchaseItem);

// E-commerce search
router.get("/ecommerce/search", wishlistController.searchEcommerce);

export default router;
