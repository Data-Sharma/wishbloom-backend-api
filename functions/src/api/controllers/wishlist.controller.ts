import {Request, Response, NextFunction} from "express";
import {WishlistService} from "../../services/storage/wishlist.service";
import {EventsService} from "../../services/events.service";
import {sendSuccess, sendCreated, sendNoContent} from "../../utils/response.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

const ensureEventOwnership = async (req: Request, eventId: string) => {
  if (!req.user) {
    throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
  }
  const event = await EventsService.getEventById(eventId);
  if (!event) {
    throw new AppError("Event not found", HTTP_STATUS.NOT_FOUND);
  }
  if (event.hostId !== req.user.uid) {
    throw new AppError("Unauthorized to manage wishlist for this event", HTTP_STATUS.FORBIDDEN);
  }
  return event;
};

export const createWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {eventId} = req.params;
    await ensureEventOwnership(req, eventId);
    const wishlist = await WishlistService.createWishlist(eventId, req.body, req.user?.uid);
    sendCreated(res, wishlist, "Wishlist created");
  } catch (err) {
    next(err);
  }
};

export const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {eventId} = req.params;
    // ownership not required to view, but you can enforce if needed
    const wishlist = await WishlistService.getWishlistByEvent(eventId);
    sendSuccess(res, wishlist || {message: "No wishlist found for event"});
  } catch (err) {
    next(err);
  }
};

export const addWishlistItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {eventId} = req.params;
    await ensureEventOwnership(req, eventId);
    // find or create wishlist for event
    let wishlist = await WishlistService.getWishlistByEvent(eventId);
    if (!wishlist) {
      wishlist = await WishlistService.createWishlist(eventId, {}, req.user?.uid);
    }
    const item = await WishlistService.addItem(wishlist.id, eventId, req.body, req.user?.uid);
    sendCreated(res, item, "Wishlist item added");
  } catch (err) {
    next(err);
  }
};

export const updateWishlistItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {itemId} = req.params;
    // Optionally check ownership: get item -> ensure event host === req.user.uid
    const updated = await WishlistService.updateItem(itemId, req.body);
    sendSuccess(res, updated, "Wishlist item updated");
  } catch (err) {
    next(err);
  }
};

export const deleteWishlistItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {itemId} = req.params;
    await WishlistService.deleteItem(itemId);
    sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

export const contributeToItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {itemId} = req.params;
    const result = await WishlistService.contributeToItem(itemId, req.user?.uid, req.body);
    sendCreated(res, result, "Contribution recorded");
  } catch (err) {
    next(err);
  }
};

export const searchEcommerce = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q || "");
    const results = await WishlistService.searchEcommerce(q);
    sendSuccess(res, results);
  } catch (err) {
    next(err);
  }
};

export const purchaseItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {itemId} = req.params;
    const purchaser = req.body;
    const item = await WishlistService.purchaseItem(itemId, purchaser);
    sendSuccess(res, item, "Item marked as purchased");
  } catch (err) {
    next(err);
  }
};
