import * as functions from "firebase-functions/v1";
import {db} from "../config/firebase.config";
import {COLLECTIONS} from "../config/constants";
import {logger} from "../utils/logger.util";

export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  await db.collection(COLLECTIONS.USERS).doc(user.uid).set({
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: new Date().toISOString(),
  });
  logger.info("User profile created", {userId: user.uid});
});

export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  await db.collection(COLLECTIONS.USERS).doc(user.uid).delete();
  logger.info("User profile deleted", {userId: user.uid});
});
