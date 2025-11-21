import {Request, Response, NextFunction} from "express";
import {GeminiService} from "../../services/ai/gemini.service";
import {sendSuccess} from "../../utils/response.util";

/**
 * Generate event theme
 */
export const generateTheme = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const theme = await GeminiService.generateEventTheme(req.body);
    sendSuccess(res, theme, "Theme generated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Generate invitation caption
 */
export const generateCaption = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const caption = await GeminiService.generateInvitationCaption(req.body);
    sendSuccess(res, {caption}, "Caption generated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Suggest vendors
 */
export const suggestVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vendors = await GeminiService.suggestVendors(req.body);
    sendSuccess(res, vendors, "Vendor suggestions generated");
  } catch (error) {
    next(error);
  }
};

/**
 * Generate memory caption
 */
export const generateMemoryCaption = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {eventType, description} = req.body;
    const caption = await GeminiService.generateMemoryCaption(eventType, description);
    sendSuccess(res, {caption}, "Memory caption generated");
  } catch (error) {
    next(error);
  }
};

/**
 * Generate event checklist
 */
export const generateChecklist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {eventType, eventDate, guestCount} = req.body;
    const checklist = await GeminiService.generateEventChecklist(
      eventType,
      eventDate,
      guestCount
    );
    sendSuccess(res, checklist, "Checklist generated successfully");
  } catch (error) {
    next(error);
  }
};
