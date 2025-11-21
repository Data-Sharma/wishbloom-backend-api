import * as functions from "firebase-functions/v1";
import express, {Request, Response} from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

// Import configurations
import {corsOptions} from "./config/cors.config";

// Import middleware
import {requestLogger} from "./middleware/logger.middleware";
import {errorHandler, notFoundHandler} from "./middleware/error.middleware";
import {apiLimiter} from "./middleware/rateLimit.middleware";

// Import routes
import eventsRoutes from "./api/routes/events.routes";
import aiRoutes from "./api/routes/ai.routes";
import guestsRoutes from "./api/routes/guests.routes";
import giftsRoutes from "./api/routes/gifts.routes";
import vendorsRoutes from "./api/routes/vendors.routes";
import invitationsRoutes from "./api/routes/invitations.routes";
import memoriesRoutes from "./api/routes/memories.routes";
import paymentsRoutes from "./api/routes/payments.routes";
import authRoutes from "./api/routes/auth.routes";

// Import triggers
import * as firestoreTriggers from "./triggers/firestore.triggers";
import * as authTriggers from "./triggers/auth.triggers";
import * as storageTriggers from "./triggers/storage.triggers";

// Import scheduled functions
import * as reminderTasks from "./scheduled/reminders.scheduled";
import * as cleanupTasks from "./scheduled/cleanup.scheduled";
import * as analyticsTasks from "./scheduled/analytics.scheduled";

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());

// Body parsing middleware
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({extended: true, limit: "10mb"}));

// Request logging
app.use(requestLogger);

// Rate limiting for API routes
app.use("/api", apiLimiter);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "WishBloom API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to WishBloom API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      events: "/api/v1/events",
      guests: "/api/v1/events/:eventId/guests",
      gifts: "/api/v1/events/:eventId/gifts",
      invitations: "/api/v1/events/:eventId/invitations",
      memories: "/api/v1/events/:eventId/memories",
      ai: "/api/v1/ai",
      vendors: "/api/v1/vendors",
      payments: "/api/v1/payments",
    },
  });
});

// API Routes
app.use("/api/v1/events", eventsRoutes);
app.use("/api/v1/events", guestsRoutes);
app.use("/api/v1/events", giftsRoutes);
app.use("/api/v1/events", invitationsRoutes);
app.use("/api/v1/events", memoriesRoutes);
app.use("/api/v1/vendors", vendorsRoutes);
app.use("/api/v1/payments", paymentsRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/auth", authRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Export Express app as Firebase Function
export const api = functions.https.onRequest(app);

// Export Firestore triggers
export const onGuestCreated = firestoreTriggers.onGuestCreated;
export const onRSVPUpdated = firestoreTriggers.onRSVPUpdated;
export const onGiftPurchased = firestoreTriggers.onGiftPurchased;

// Export scheduled functions
export const sendEventReminders = reminderTasks.sendEventReminders;
export const cleanupExpiredEvents = reminderTasks.cleanupExpiredEvents;
export const cleanupDraftEvents = cleanupTasks.cleanupDraftEvents;
export const purgeOldNotifications = cleanupTasks.purgeOldNotifications;
export const aggregateEventAnalytics = analyticsTasks.aggregateEventAnalytics;

// Export authentication triggers
export const onUserCreated = authTriggers.onUserCreated;
export const onUserDeleted = authTriggers.onUserDeleted;

// Export storage triggers
export const onStorageFileUploaded = storageTriggers.onFileUploaded;
export const onStorageFileDeleted = storageTriggers.onFileDeleted;
