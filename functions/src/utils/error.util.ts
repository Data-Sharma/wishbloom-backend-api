import {HTTP_STATUS} from "../config/constants";

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    isOperational = true
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a Bad Request error (400)
 */
export const createBadRequestError = (message: string): AppError => {
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Create an Unauthorized error (401)
 */
export const createUnauthorizedError = (message = "Unauthorized"): AppError => {
  return new AppError(message, HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Create a Forbidden error (403)
 */
export const createForbiddenError = (message = "Forbidden"): AppError => {
  return new AppError(message, HTTP_STATUS.FORBIDDEN);
};

/**
 * Create a Not Found error (404)
 */
export const createNotFoundError = (resource: string): AppError => {
  return new AppError(`${resource} not found`, HTTP_STATUS.NOT_FOUND);
};

/**
 * Create a Conflict error (409)
 */
export const createConflictError = (message: string): AppError => {
  return new AppError(message, HTTP_STATUS.CONFLICT);
};

/**
 * Create an Internal Server error (500)
 */
export const createInternalError = (message = "Internal server error"): AppError => {
  return new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};
