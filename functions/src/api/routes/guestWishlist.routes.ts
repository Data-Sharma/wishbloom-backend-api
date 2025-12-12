import {Router} from "express";
import {getGuestWishlist, guestContributeToItem, guestPurchaseItem} from "../controllers/guestWishlist.controller";

const router = Router();

// Guest-facing wishlist endpoints (no auth; secured by invitationId token)

// View wishlist for invitation's event
router.get(
  "/guest/invitations/:invitationId/wishlist",
  getGuestWishlist
);

// Contribute to an item as a guest
router.post(
  "/guest/invitations/:invitationId/wishlist/items/:itemId/contribute",
  guestContributeToItem
);

// Mark an item as purchased as a guest
router.post(
  "/guest/invitations/:invitationId/wishlist/items/:itemId/purchase",
  guestPurchaseItem
);

export default router;
