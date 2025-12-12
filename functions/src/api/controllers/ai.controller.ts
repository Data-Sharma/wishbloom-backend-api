import {Request, Response, NextFunction} from "express";
import {GeminiService} from "../../services/ai/gemini.service";
import {ContentGeneratorService} from "../../services/ai/content-generator.service";
import {ThemeGeneratorService} from "../../services/ai/theme-generator.service";
import {GiftRecommendationService} from "../../services/ai/gift-recommendation.service";
import {sendSuccess, sendCreated} from "../../utils/response.util";

/**
 * POST /api/v1/ai/event-planner
 * Body: { eventType, eventDate, guestCount, budget, preferences, question }
 */
export const eventPlanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = req.body;
    const {eventType, eventDate, guestCount} = payload;
    // Use checklist generator as the planner core
    const plan = await ThemeGeneratorService.generateChecklist(eventType, eventDate, guestCount);
    sendSuccess(res, plan);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/ai/generate-invitation
 * Body: { eventTitle, eventDate, eventLocation, tone, extraDetails }
 */
export const generateInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = req.body;
    // Delegate to ContentGeneratorService which wraps Gemini caption generator
    const invitation = await ContentGeneratorService.generateInvitationCaption(input);
    sendCreated(res, invitation, "Invitation generated");
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/ai/recommend-theme
 * Body: { eventType, mood, colorPreferences, guestDemographics, budget }
 */
export const recommendTheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = req.body;
    if (ThemeGeneratorService.generateThemeSuggestions) {
      const themes = await ThemeGeneratorService.generateThemeSuggestions(input);
      sendSuccess(res, themes);
      return;
    }
    const themes = await GeminiService.generateEventTheme(input);
    sendSuccess(res, themes);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/ai/generate-caption
 * Accepts multipart file (image/video) via middleware or text-only
 * Body (text-only): { imageDescription, eventTitle, length, tone }
 * If file present, middleware will set req.fileBuffer and req.fileMime
 */
export const generateCaption = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {imageDescription, eventTitle, tone} = req.body;
    // If file uploaded, Gemini vision method
    // @ts-ignore - upload middleware attaches fileBuffer
    const fileBuffer: Buffer | undefined = (req as any).fileBuffer;
    // @ts-ignore
    const fileMime: string | undefined = (req as any).fileMime;
    // Use text-only caption generation via ContentGeneratorService
    void fileBuffer;
    void fileMime;

    const caption = await ContentGeneratorService.generateInvitationCaption({
      eventType: imageDescription || "event",
      eventTitle: eventTitle || "",
      eventDate: new Date().toISOString(),
      tone: tone || "fun",
    });
    sendSuccess(res, caption, "Caption generated");
  } catch (error) {
    next(error);
  }
};

/**
 * existing generateMemoryCaption (text-only) - keep compatibility
 */
export const generateMemoryCaption = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventType, description} = req.body;
    // If image file present use vision method
    // @ts-ignore
    const fileBuffer: Buffer | undefined = (req as any).fileBuffer;
    // @ts-ignore
    const fileMime: string | undefined = (req as any).fileMime;
    void fileBuffer;
    void fileMime;

    const caption = await GeminiService.generateMemoryCaption(eventType, description);
    sendSuccess(res, {caption}, "Memory caption generated");
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/ai/gift-recommendations/host
 * Body: { eventId, maxItems?, budgetMin?, budgetMax?, categories? }
 */
export const hostGiftRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {eventId, maxItems, budgetMin, budgetMax, categories} = req.body;
    const recs = await GiftRecommendationService.getHostRecommendations(eventId, {
      maxItems,
      budgetMin,
      budgetMax,
      categories,
    });
    sendSuccess(res, recs);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/ai/gift-recommendations/guest
 * Body: { invitationId, maxItems?, budgetMin?, budgetMax?, categories? }
 */
export const guestGiftRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {invitationId, maxItems, budgetMin, budgetMax, categories} = req.body;
    const recs = await GiftRecommendationService.getGuestRecommendations(invitationId, {
      maxItems,
      budgetMin,
      budgetMax,
      categories,
    });
    sendSuccess(res, recs);
  } catch (error) {
    next(error);
  }
};
