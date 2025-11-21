import {Request, Response, NextFunction} from "express";
import {StripeService} from "../../services/payment/stripe.service";
import {sendCreated, sendSuccess} from "../../utils/response.util";

export const createPaymentIntent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const paymentIntent = await StripeService.createPaymentIntent(req.body);
    sendCreated(res, paymentIntent, "Payment intent created");
  } catch (error) {
    next(error);
  }
};

export const confirmPaymentIntent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {paymentIntentId} = req.params;
    const paymentIntent = await StripeService.confirmPayment(paymentIntentId);
    sendSuccess(res, paymentIntent, "Payment confirmed");
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {paymentIntentId} = req.params;
    const refund = await StripeService.refundPayment(paymentIntentId, req.body.amount);
    sendSuccess(res, refund, "Payment refunded");
  } catch (error) {
    next(error);
  }
};

export const getPaymentIntent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {paymentIntentId} = req.params;
    const paymentIntent = await StripeService.getPaymentIntent(paymentIntentId);
    sendSuccess(res, paymentIntent);
  } catch (error) {
    next(error);
  }
};
