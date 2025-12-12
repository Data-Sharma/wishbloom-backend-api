import {Router} from "express";
import * as paymentController from "../controllers/payment.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validate} from "../../middleware/validation.middleware";
import {createPaymentIntentSchema, refundPaymentSchema} from "../validators/payments.validator";

const router = Router();

// Create payment (authenticated optional, but we'll allow authenticated)
router.post("/initiate", authenticate, validate(createPaymentIntentSchema), paymentController.initiate);

// Verify payment (can be called by client after webhook or directly)
router.post("/verify", validate((() => ({body: {paymentIntentId: {required: true}}})) as any), paymentController.verify);

// List transactions (authenticated)
router.get("/transactions", authenticate, paymentController.listTransactions);

// Refund (authenticated; authorize admin or host if you want - currently basic auth)
router.post("/refund", authenticate, validate(refundPaymentSchema), paymentController.refund);

export default router;
