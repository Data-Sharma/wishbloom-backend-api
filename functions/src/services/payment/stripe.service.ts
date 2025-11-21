import Stripe from "stripe";
import {config} from "../../config/env.config";
import {logger} from "../../utils/logger.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

const STRIPE_API_VERSION = "2025-10-29.clover";

let stripeClient: Stripe | null = null;

const getStripeClient = (): Stripe => {
  if (stripeClient) {
    return stripeClient;
  }

  if (!config.stripeSecretKey || config.stripeSecretKey.trim().length === 0) {
    throw new AppError(
      "Stripe secret key is not configured. Set STRIPE_SECRET_KEY or firebase functions config.",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  stripeClient = new Stripe(config.stripeSecretKey, {
    apiVersion: STRIPE_API_VERSION,
  });

  return stripeClient;
};

export interface CreatePaymentIntentData {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

/**
 * Stripe Payment Service
 */
export class StripeService {
  /**
   * Create a payment intent
   */
  static async createPaymentIntent(data: CreatePaymentIntentData): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await getStripeClient().paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency || "usd",
        metadata: data.metadata || {},
      });

      logger.info("Payment intent created", {paymentIntentId: paymentIntent.id});
      return paymentIntent;
    } catch (error) {
      logger.error("Error creating payment intent", error);
      throw new AppError("Failed to create payment", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Confirm a payment
   */
  static async confirmPayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await getStripeClient().paymentIntents.confirm(paymentIntentId);
      logger.info("Payment confirmed", {paymentIntentId});
      return paymentIntent;
    } catch (error) {
      logger.error("Error confirming payment", error);
      throw new AppError("Failed to confirm payment", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Refund a payment
   */
  static async refundPayment(
    paymentIntentId: string,
    amount?: number
  ): Promise<Stripe.Refund> {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await getStripeClient().refunds.create(refundData);
      logger.info("Payment refunded", {refundId: refund.id});
      return refund;
    } catch (error) {
      logger.error("Error refunding payment", error);
      throw new AppError("Failed to refund payment", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    try {
      const event = getStripeClient().webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (error) {
      logger.error("Webhook signature verification failed", error);
      throw new AppError("Invalid webhook signature", HTTP_STATUS.BAD_REQUEST);
    }
  }

  /**
   * Create a customer
   */
  static async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Customer> {
    try {
      const customer = await getStripeClient().customers.create({
        email,
        name,
        metadata,
      });

      logger.info("Customer created", {customerId: customer.id});
      return customer;
    } catch (error) {
      logger.error("Error creating customer", error);
      throw new AppError("Failed to create customer", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Attach payment method to customer
   */
  static async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await getStripeClient().paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      logger.info("Payment method attached", {paymentMethodId, customerId});
      return paymentMethod;
    } catch (error) {
      logger.error("Error attaching payment method", error);
      throw new AppError("Failed to attach payment method", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get payment intent by ID
   */
  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await getStripeClient().paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error("Error retrieving payment intent", error);
      throw new AppError("Payment not found", HTTP_STATUS.NOT_FOUND);
    }
  }
}
