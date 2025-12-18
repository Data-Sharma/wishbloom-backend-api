import {Request, Response, NextFunction} from "express";
import {AnalyticsService} from "../../services/analytics.service";
import {sendSuccess} from "../../utils/response.util";

/**
 * GET /api/events/:eventId/analytics
 * Get event analytics (comprehensive engagement metrics)
 */
export const getEventAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {eventId} = req.params;
    const metrics = await AnalyticsService.getEventEngagementMetrics(eventId);
    sendSuccess(res, metrics);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/:eventId/engagement
 * Get engagement metrics for an event
 */
export const getEventEngagementMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {eventId} = req.params;
    const metrics = await AnalyticsService.getEventEngagementMetrics(eventId);
    sendSuccess(res, metrics);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/:eventId/engagement/trends
 * Get engagement trends over time
 */
export const getEngagementTrends = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {eventId} = req.params;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
    const trends = await AnalyticsService.getEngagementTrends(eventId, days);
    sendSuccess(res, trends);
  } catch (error) {
    next(error);
  }
};

