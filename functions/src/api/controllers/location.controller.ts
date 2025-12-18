import {Request, Response, NextFunction} from "express";
import {LocationService} from "../../services/location/location.service";
import {sendSuccess} from "../../utils/response.util";
import {logger} from "../../utils/logger.util";

/**
 * Resolve event location from Google Place ID
 */
export const resolveEventLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {placeId} = req.body;

    logger.info("Location resolution request", { placeId });

    const locationData = await LocationService.resolvePlaceId(placeId);
    
    sendSuccess(res, locationData, "Location resolved successfully");
  } catch (error) {
    next(error);
  }
};
