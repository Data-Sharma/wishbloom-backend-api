import {Request, Response, NextFunction} from "express";
import Joi from "joi";
import {AppError} from "../utils/error.util";
import {HTTP_STATUS} from "../config/constants";

/**
 * Validate request body against Joi schema
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const {error, value} = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      throw new AppError(errorMessage, HTTP_STATUS.BAD_REQUEST);
    }

    // Replace body with validated and sanitized value
    req.body = value;
    next();
  };
};

/**
 * Validate query parameters against Joi schema
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const {error, value} = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      throw new AppError(errorMessage, HTTP_STATUS.BAD_REQUEST);
    }

    req.query = value;
    next();
  };
};

/**
 * Validate URL parameters against Joi schema
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const {error, value} = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      throw new AppError(errorMessage, HTTP_STATUS.BAD_REQUEST);
    }

    req.params = value;
    next();
  };
};
