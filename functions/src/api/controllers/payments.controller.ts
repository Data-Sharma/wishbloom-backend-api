import {Request, Response, NextFunction} from "express";
import {PaymentService} from "../../services/payment.service";
import {sendCreated, sendSuccess} from "../../utils/response.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

/**
 * POST /api/payment/initiate
 * Body: { amount, currency, eventId?, metadata? }
 */
export const initiate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.uid;
    const payload = req.body;
    const result = await PaymentService.initiatePayment(userId, payload);
    sendCreated(res, result, "Payment initiated");
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payment/verify
 * Body: { paymentIntentId }
 */
export const verify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {paymentIntentId} = req.body as { paymentIntentId?: string };
    if (!paymentIntentId) throw new AppError("paymentIntentId required", HTTP_STATUS.BAD_REQUEST);

    const result = await PaymentService.verifyPayment(paymentIntentId);
    sendSuccess(res, result, "Payment verified");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payment/transactions
 * Query: userId, eventId, provider, limit
 */
export const listTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const txs = await PaymentService.listTransactions(query);
    sendSuccess(res, txs);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payment/refund
 * Body: { paymentIntentId, amount? }
 */
export const refund = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {paymentIntentId, amount} = req.body as { paymentIntentId?: string; amount?: number };
    if (!paymentIntentId) throw new AppError("paymentIntentId required", HTTP_STATUS.BAD_REQUEST);

    const result = await PaymentService.refundPayment(paymentIntentId, amount);
    sendSuccess(res, result, "Payment refunded");
  } catch (err) {
    next(err);
  }
};
