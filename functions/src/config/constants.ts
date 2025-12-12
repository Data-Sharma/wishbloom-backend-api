// Firestore Collections
export const COLLECTIONS = {
  USERS: "users",
  EVENTS: "events",
  GUESTS: "guests",
  GIFTS: "gifts",
  VENDORS: "vendors",
  VENDOR_QUOTES: "vendorQuotes",
  VENDOR_BOOKINGS: "vendorBookings",
  VENDOR_REVIEWS: "vendorReviews",
  INVITATIONS: "invitations",
  MEMORIES: "memories",
  PAYMENTS: "payments",
  NOTIFICATIONS: "notifications",
  NOTIFICATION_PREFERENCES: "notificationPreferences",
  MEDIA: "media",
  TRANSACTIONS: "transactions",
  WISHLISTS: "wishlists",
  WISHLIST_ITEMS: "wishlistItems",
  WISHLIST_CONTRIBUTIONS: "wishlistContributions",
  INVITATION_TEMPLATES: "invitation_templates",


};

// Event Types
export const EVENT_TYPES = {
  BIRTHDAY: "birthday",
  WEDDING: "wedding",
  ANNIVERSARY: "anniversary",
  GRADUATION: "graduation",
  BABY_SHOWER: "baby_shower",
  RETIREMENT: "retirement",
  OTHER: "other",
};

// Event Status
export const EVENT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// RSVP Status
export const RSVP_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  MAYBE: "maybe",
};

// Gift Status
export const GIFT_STATUS = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  PURCHASED: "purchased",
  DELIVERED: "delivered",
};

// User Roles
export const USER_ROLES = {
  HOST: "host",
  GUEST: "guest",
  VENDOR: "vendor",
  ADMIN: "admin",
};

export const NOTIFICATION_TYPES = {
  EVENT_INVITATION: "event_invitation",
  RSVP_UPDATE: "rsvp_update",
  GIFT_PURCHASE: "gift_purchase",
  EVENT_REMINDER: "event_reminder",
  VENDOR_MESSAGE: "vendor_message",
  MEMORY_UPLOAD: "memory_upload",
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const REDIRECT_WHITELIST = [
  "https://wishbloom.com",
  "https://www.wishbloom.com",
  "http://localhost:5173", // Dev frontend
  "http://localhost:3000", // Alternate dev
];
