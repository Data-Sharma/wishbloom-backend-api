import {Response} from "express";
import {HTTP_STATUS} from "../config/constants";

interface SuccessResponse {
  success: true;
  data: any;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: number;
  };
}

/**
 * Send success response with data
 */
export const sendSuccess = (
  res: Response,
  data: any,
  message?: string
): Response<SuccessResponse> => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data,
    ...(message && {message}),
  });
};

/**
 * Send created response (201)
 */
export const sendCreated = (
  res: Response,
  data: any,
  message?: string
): Response<SuccessResponse> => {
  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data,
    message: message || "Resource created successfully",
  });
};

/**
 * Send no content response (204)
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
): Response<ErrorResponse> => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: statusCode,
    },
  });
};
