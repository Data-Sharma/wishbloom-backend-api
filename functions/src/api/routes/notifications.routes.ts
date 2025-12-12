import {Router} from "express";
import * as notificationsController from "../controllers/notifications.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {adminOnly} from "../../middleware/adminAuth.middleware";
import {validate, validateParams, validateQuery} from "../../middleware/validation.middleware";
import {
  sendNotificationSchema,
  getUserNotificationsQuerySchema,
  markReadParamsSchema,
  updatePreferencesSchema,
} from "../validators/notifications.validator";

const router = Router();

// user endpoints (require auth)
router.get("/", authenticate, validateQuery(getUserNotificationsQuerySchema), notificationsController.getUserNotifications);
router.put("/preferences", authenticate, validate(updatePreferencesSchema), notificationsController.updatePreferences);
router.get("/preferences", authenticate, notificationsController.getPreferences);
router.post("/:notificationId/read", authenticate, validateParams(markReadParamsSchema), notificationsController.markNotificationRead);

// admin/system endpoint to send notifications
router.post("/system/send", authenticate, adminOnly, validate(sendNotificationSchema), notificationsController.sendSystemNotification);

export default router;
