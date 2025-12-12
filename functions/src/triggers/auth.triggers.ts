import * as functions from "firebase-functions/v1";
import {db} from "../config/firebase.config";
import {COLLECTIONS} from "../config/constants";
import {logger} from "../utils/logger.util";

export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const role = (user.customClaims?.role) || "guest"; // default role

  await db.collection(COLLECTIONS.USERS).doc(user.uid).set({
    user_id: user.uid,
    email: user.email || null,
    phone: user.phoneNumber || null,
    name: user.displayName || null,
    avatar_url: user.photoURL || null,
    role,
    preferences: {}, // default empty preferences
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, {merge: true});

  logger.info("User profile created", {userId: user.uid});
});

export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  await db.collection(COLLECTIONS.USERS).doc(user.uid).delete();
  logger.info("User profile deleted", {userId: user.uid});
});
