import {Request, Response, NextFunction} from "express";
import {auth, db} from "../../config/firebase.config";
import {COLLECTIONS, HTTP_STATUS, USER_ROLES} from "../../config/constants";
import {config} from "../../config/env.config";
import {AppError} from "../../utils/error.util";
import {sendCreated, sendSuccess} from "../../utils/response.util";
import {logger} from "../../utils/logger.util";

interface IdentityToolkitResponse {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  email: string;
  registered?: boolean;
}

interface AuthTokens {
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Build the Auth REST API URL, supporting both emulator and production.
 *
 * When the Firebase Auth emulator is enabled (FIREBASE_AUTH_EMULATOR_HOST),
 * we call the emulator endpoint and the API key is effectively ignored.
 * In production, we still require a valid Web API key.
 */
const getAuthRestUrl = (): string => {
  const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;

  if (emulatorHost) {
    const apiKey =
      config.firebaseWebApiKey ||
      config.identityToolkitApiKey ||
      process.env.FIREBASE_WEB_API_KEY ||
      "demo-api-key";
    return `http://${emulatorHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
  }

  // In production you should set FIREBASE_WEB_API_KEY or similar;
  // here we rely on environment / runtime config to already be wired.
  const apiKey = config.identityToolkitApiKey || config.firebaseWebApiKey;

  if (!apiKey) {
    logger.error("Auth REST API key missing in configuration");
    throw new AppError(
      "Authentication service is not configured",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  return `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
};

const signInWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<AuthTokens & { localId: string }> => {
  try {
    const url = getAuthRestUrl();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const payload = (await response.json()) as IdentityToolkitResponse & {
      error?: { message: string };
    };

    if (!response.ok) {
      logger.warn("Identity Toolkit login failed", {
        email,
        error: payload.error?.message,
      });

      const code = payload.error?.message;

      if (code === "INVALID_PASSWORD") {
        throw new AppError(
          "Invalid email or password",
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (code === "EMAIL_NOT_FOUND") {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
      }

      throw new AppError(
        "Unable to login user",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return {
      idToken: payload.idToken,
      refreshToken: payload.refreshToken,
      expiresIn: Number(payload.expiresIn),
      localId: payload.localId,
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error("Unexpected error during Identity Toolkit login", error);
    throw new AppError("Unable to login user", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const mapFirebaseError = (error: any, defaultMessage: string): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  switch (error?.code) {
  case "auth/email-already-exists":
    return new AppError("Email already in use", HTTP_STATUS.CONFLICT);
  case "auth/invalid-email":
    return new AppError("Invalid email address", HTTP_STATUS.BAD_REQUEST);
  case "auth/invalid-password":
    return new AppError("Password must be at least 6 characters", HTTP_STATUS.BAD_REQUEST);
  case "auth/user-not-found":
    return new AppError("Account not found", HTTP_STATUS.NOT_FOUND);
  default:
    logger.error("Unhandled Firebase error", error);
    return new AppError(defaultMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {email, password, displayName, role} = req.body as {
      email: string;
      password: string;
      displayName?: string;
      role?: string;
    };

    if (!email || !password) {
      throw new AppError(
        "Email and password are required",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const normalizedRole = role || USER_ROLES.HOST;

    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false,
      disabled: false,
    });

    await auth.setCustomUserClaims(userRecord.uid, {
      role: normalizedRole,
    });

    await db.collection(COLLECTIONS.USERS).doc(userRecord.uid).set(
      {
        email,
        displayName: displayName || null,
        role: normalizedRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {merge: true}
    );

    sendCreated(
      res,
      {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          role: normalizedRole,
        },
      },
      "Account created successfully"
    );
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(mapFirebaseError(error, "Failed to create account"));
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {email, password} = req.body as { email: string; password: string };

    if (!email || !password) {
      throw new AppError(
        "Email and password are required",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Ensure user exists before attempting password authentication
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
      }
      throw err;
    }

    const tokens = await signInWithEmailAndPassword(email, password);
    const claims = (userRecord.customClaims || {}) as { role?: string };
    const role = claims.role || USER_ROLES.HOST;

    sendSuccess(
      res,
      {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          role,
        },
        tokens: {
          idToken: tokens.idToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
      },
      "Login successful"
    );
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(mapFirebaseError(error, "Failed to login"));
  }
};

