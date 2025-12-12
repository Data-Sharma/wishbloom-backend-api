import {Request, Response, NextFunction} from "express";
import {createUnauthorizedError, createForbiddenError} from "../utils/error.util";

/**
 * adminOnly middleware
 * - Assumes authenticate middleware already ran and set req.user
 * - Checks either req.user.role === 'admin' or req.user.isAdmin === true
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  if (!user) {
    return next(createUnauthorizedError("Authentication required"));
  }

  const isAdmin =
    (user.role && String(user.role).toLowerCase() === "admin") ||
    (user.isAdmin === true) ||
    ((user as any).admin === true);

  if (!isAdmin) {
    return next(createForbiddenError("Admin access required"));
  }

  return next();
};
