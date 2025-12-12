import {Request, Response, NextFunction} from "express";
import {InvitationsService} from "../../services/invitations.service";
import {WishlistService} from "../../services/storage/wishlist.service";
import {sendSuccess, sendCreated} from "../../utils/response.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

// Resolve invitation and ensure it belongs to an event
const resolveInvitation = async (invitationId: string) => {
  const invitation = await InvitationsService.getInvitationById(invitationId);
  if (!invitation) {
    throw new AppError("Invitation not found", HTTP_STATUS.NOT_FOUND);
  }
  if (!invitation.eventId) {
    throw new AppError("Invitation is missing event reference", HTTP_STATUS.BAD_REQUEST);
  }
  return invitation;
};

// GET /api/guest/invitations/:invitationId/wishlist
export const getGuestWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {invitationId} = req.params;
    const invitation = await resolveInvitation(invitationId);
    const wishlist = await WishlistService.getWishlistByEvent(invitation.eventId);
    // For guests it's okay to return empty or minimal structure
    sendSuccess(res, wishlist || {message: "No wishlist found for this event"});
  } catch (error) {
    next(error);
  }
};

// POST /api/guest/invitations/:invitationId/wishlist/items/:itemId/contribute
export const guestContributeToItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {invitationId, itemId} = req.params;
    await resolveInvitation(invitationId);
    // Guests may not be authenticated; record without userId
    const result = await WishlistService.contributeToItem(itemId, undefined, req.body);
    sendCreated(res, result, "Contribution recorded");
  } catch (error) {
    next(error);
  }
};

// POST /api/guest/invitations/:invitationId/wishlist/items/:itemId/purchase
export const guestPurchaseItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {invitationId, itemId} = req.params;
    await resolveInvitation(invitationId);
    const purchaser = req.body;
    const item = await WishlistService.purchaseItem(itemId, purchaser);
    sendSuccess(res, item, "Item marked as purchased");
  } catch (error) {
    next(error);
  }
};
