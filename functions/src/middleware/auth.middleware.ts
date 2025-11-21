import {Request, Response, NextFunction} from "express";
import {auth} from "../config/firebase.config";
import {AppError} from "../utils/error.util";
import {HTTP_STATUS} from "../config/constants";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        role?: string;
        emailVerified?: boolean;
      };
    }
  }
}

/**
 * Verify Firebase ID token and attach user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(token);

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role,
      emailVerified: decodedToken.email_verified,
    };

    next();
  } catch (error) {
    next(new AppError("Invalid or expired token", HTTP_STATUS.UNAUTHORIZED));
  }
};

/**
 * Check if user has required role
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      throw new AppError(
        "Insufficient permissions",
        HTTP_STATUS.FORBIDDEN
      );
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      const decodedToken = await auth.verifyIdToken(token);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role,
        emailVerified: decodedToken.email_verified,
      };
    }

    next();
  } catch (error) {
    // Continue without auth
    next();
  }
};

/**
 * Require email verification
 */
export const requireEmailVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.emailVerified) {
    throw new AppError(
      "Email verification required",
      HTTP_STATUS.FORBIDDEN
    );
  }

  next();
};
