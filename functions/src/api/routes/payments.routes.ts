import {Router} from "express";
import * as paymentsController from "../controllers/payments.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validate, validateParams} from "../../middleware/validation.middleware";
import {createPaymentIntentSchema, refundPaymentSchema} from "../validators/payments.validator";
import {paymentIntentParamsSchema} from "../validators/common.validator";

const router = Router();

router.post(
  "/intents",
  authenticate,
  validate(createPaymentIntentSchema),
  paymentsController.createPaymentIntent
);

router.post(
  "/intents/:paymentIntentId/confirm",
  authenticate,
  validateParams(paymentIntentParamsSchema),
  paymentsController.confirmPaymentIntent
);

router.post(
  "/intents/:paymentIntentId/refund",
  authenticate,
  validateParams(paymentIntentParamsSchema),
  validate(refundPaymentSchema),
  paymentsController.refundPayment
);

router.get(
  "/intents/:paymentIntentId",
  authenticate,
  validateParams(paymentIntentParamsSchema),
  paymentsController.getPaymentIntent
);

export default router;
