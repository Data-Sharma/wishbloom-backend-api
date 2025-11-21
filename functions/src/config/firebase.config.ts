import * as admin from "firebase-admin";
import {config} from "./env.config";

const appOptions: admin.AppOptions = {};

if (config.projectId) {
  appOptions.projectId = config.projectId;
}

if (config.storageBucket) {
  appOptions.storageBucket = config.storageBucket;
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp(appOptions);
}

// Firestore instance
export const db = admin.firestore();

// Auth instance
export const auth = admin.auth();

// Storage instance
export const storage = admin.storage();

// Messaging instance
export const messaging = admin.messaging();

// Set Firestore settings
db.settings({
  ignoreUndefinedProperties: true,
});

export {admin};
