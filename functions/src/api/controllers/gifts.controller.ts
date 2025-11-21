import {Request, Response, NextFunction} from "express";
import {GiftsService} from "../../services/gifts.service";
import {EventsService} from "../../services/events.service";
import {sendCreated, sendNoContent, sendSuccess} from "../../utils/response.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

const ensureEventOwnership = async (req: Request, eventId: string) => {
  if (!req.user) {
    throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
  }

  const event = await EventsService.getEventById(eventId);
  if (event.hostId !== req.user.uid) {
    throw new AppError("Unauthorized to manage gifts for this event", HTTP_STATUS.FORBIDDEN);
  }

  return event;
};

export const listGifts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    await ensureEventOwnership(req, eventId);
    const gifts = await GiftsService.listGifts(eventId);
    sendSuccess(res, gifts);
  } catch (error) {
    next(error);
  }
};

export const addGift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    await ensureEventOwnership(req, eventId);
    const gift = await GiftsService.addGift(eventId, req.body);
    sendCreated(res, gift, "Gift added to registry");
  } catch (error) {
    next(error);
  }
};

export const updateGift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId, giftId} = req.params;
    await ensureEventOwnership(req, eventId);
    await GiftsService.updateGift(eventId, giftId, req.body);
    const gift = await GiftsService.getGift(eventId, giftId);
    sendSuccess(res, gift, "Gift updated successfully");
  } catch (error) {
    next(error);
  }
};

export const removeGift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId, giftId} = req.params;
    await ensureEventOwnership(req, eventId);
    await GiftsService.removeGift(eventId, giftId);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

export const updateGiftStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId, giftId} = req.params;
    await ensureEventOwnership(req, eventId);
    const gift = await GiftsService.updateGiftStatus(eventId, giftId, req.body);
    sendSuccess(res, gift, "Gift status updated");
  } catch (error) {
    next(error);
  }
};
