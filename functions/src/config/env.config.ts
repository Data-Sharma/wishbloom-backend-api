import * as functions from "firebase-functions/v1";

const loadRuntimeConfig = (): Record<string, any> => {
  try {
    const fn = (functions as unknown as { config?: () => Record<string, any> }).config;
    if (typeof fn === "function") {
      return fn() || {};
    }
  } catch {
    // No runtime config available (e.g., local emulator)
  }
  return {};
};

const runtimeConfig = loadRuntimeConfig();

const projectId = process.env.GCLOUD_PROJECT || runtimeConfig.project?.id;
const storageBucket =
  process.env.FIREBASE_STORAGE_BUCKET || runtimeConfig.firebase?.storage_bucket;
const firebaseWebApiKey = process.env.FIREBASE_WEB_API_KEY || runtimeConfig.firebase?.api_key;
const identityToolkitApiKey =
  process.env.IDENTITY_TOOLKIT_API_KEY ||
  runtimeConfig.identitytoolkit?.api_key ||
  firebaseWebApiKey;

export const config = {
  // Firebase
  projectId,
  storageBucket,
  region: "us-central1",
  firebase: {
    projectId,
    storageBucket,
    region: "us-central1",
  },

  // API Keys
  firebaseWebApiKey,
  geminiApiKey: process.env.GEMINI_API_KEY || runtimeConfig.gemini?.api_key,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || runtimeConfig.stripe?.secret_key,
  sendgridApiKey: process.env.SENDGRID_API_KEY || runtimeConfig.sendgrid?.api_key,
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || runtimeConfig.google?.maps_api_key,
  identityToolkitApiKey,
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || runtimeConfig.stripe?.secret_key,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || runtimeConfig.stripe?.webhook_secret,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || runtimeConfig.sendgrid?.api_key,
    fromEmail: process.env.SENDGRID_FROM_EMAIL || runtimeConfig.sendgrid?.from_email || "noreply@wishbloom.com",
    fromName: process.env.SENDGRID_FROM_NAME || runtimeConfig.sendgrid?.from_name || "WishBloom",
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || runtimeConfig.twilio?.account_sid,
    authToken: process.env.TWILIO_AUTH_TOKEN || runtimeConfig.twilio?.auth_token,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || runtimeConfig.twilio?.phone_number,
  },

  // URLs
  frontendUrl: process.env.FRONTEND_URL || runtimeConfig.frontend?.url || "http://localhost:5173",
  apiUrl: process.env.API_URL || runtimeConfig.api?.url,
  app: {
    environment: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || runtimeConfig.frontend?.url || "http://localhost:5173",
    apiVersion: process.env.API_VERSION || "v1",
  },

  // Features
  features: {
    aiEnabled: true,
    paymentsEnabled: true,
    emailEnabled: true,
    analyticsEnabled: true,
  },

  // Limits
  limits: {
    maxEventsPerUser: 50,
    maxGuestsPerEvent: 500,
    maxGiftsPerEvent: 100,
  },
};
