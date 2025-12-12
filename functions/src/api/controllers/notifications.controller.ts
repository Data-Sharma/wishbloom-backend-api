import {Request, Response, NextFunction} from "express";
import {NotificationService} from "../../services/notification/notification.service";
import {sendSuccess, sendCreated} from "../../utils/response.util";
import {AppError} from "../../utils/error.util";

export const getUserNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = await NotificationService.getUserNotifications(req.user?.uid || "", req.query as any);
    sendSuccess(res, notifications);
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notificationId = req.params.notificationId;
    if (!notificationId) throw new AppError("notificationId required", 400);
    await NotificationService.markAsRead(notificationId, req.user?.uid || "");
    sendSuccess(res, null, "Marked as read");
  } catch (err) {
    next(err);
  }
};

export const getPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const prefs = await NotificationService.getPreferences(req.user?.uid || "");
    sendSuccess(res, prefs || {email: true, push: true, sms: false});
  } catch (err) {
    next(err);
  }
};

export const updatePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await NotificationService.updatePreferences(req.user?.uid || "", req.body);
    sendSuccess(res, updated, "Preferences updated");
  } catch (err) {
    next(err);
  }
};

// Admin/system only: send notifications to list of users
export const sendSystemNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {userIds, title, message, data} = req.body;
    const results = await NotificationService.sendSystemNotificationToUsers(userIds, title, message, data);
    sendCreated(res, results, "Notifications sent");
  } catch (err) {
    next(err);
  }
};
