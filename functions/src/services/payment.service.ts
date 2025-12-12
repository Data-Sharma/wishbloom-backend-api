import {StripeService, CreatePaymentIntentData} from "./payment/stripe.service";
import {FirestoreService} from "./database/firestore.service";
import {COLLECTIONS, PAYMENT_STATUS, HTTP_STATUS} from "../config/constants";
import {logger} from "../utils/logger.util";
import {AppError} from "../utils/error.util";
import {WishlistService} from "./storage/wishlist.service";

/**
 * PaymentService
 * - Uses StripeService for creating/confirming/refunding payments
 * - Persists transaction records in Firestore under COLLECTIONS.TRANSACTIONS
 */
export class PaymentService {
  /**
   * Initiate payment (create payment intent + create transaction record)
   */
  static async initiatePayment(userId: string | undefined, data: CreatePaymentIntentData & { eventId?: string, metadata?: Record<string, string> }) {
    // Create payment intent with Stripe
    const intent = await StripeService.createPaymentIntent({
      amount: data.amount,
      currency: data.currency,
      metadata: data.metadata,
    });

    // Persist transaction record
    const tx = await FirestoreService.createDocument(COLLECTIONS.TRANSACTIONS, {
      user_id: userId || null,
      event_id: data.eventId || null,
      provider: "stripe",
      provider_id: intent.id,
      amount: data.amount,
      currency: data.currency,
      status: PAYMENT_STATUS.PENDING,
      metadata: data.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    logger.info("Payment initiated", {transactionId: tx.id, intentId: intent.id, userId});
    return {
      transaction: tx,
      paymentIntent: {
        id: intent.id,
        client_secret: (intent as any).client_secret, // stripe returns client_secret for client usage
        amount: intent.amount,
        currency: intent.currency,
        status: (intent as any).status,
      },
    };
  }

  /**
   * Verify payment by fetching intent from Stripe and updating transaction
   */
  static async verifyPayment(providerId: string) {
    if (!providerId) throw new AppError("paymentIntentId required", HTTP_STATUS.BAD_REQUEST);

    // Fetch payment intent
    const intent = await StripeService.getPaymentIntent(providerId);

    // Find transaction by provider_id
    const txs = await FirestoreService.getDocuments(COLLECTIONS.TRANSACTIONS, [
      {field: "provider_id", operator: "==", value: providerId},
    ]);

    const tx = txs && txs.length > 0 ? txs[0] : null;

    // Map stripe status to our status
    const stripeStatus = (intent as any).status || "";
    let mappedStatus = PAYMENT_STATUS.PENDING;
    if (["succeeded", "requires_capture", "processing"].includes(stripeStatus)) mappedStatus = PAYMENT_STATUS.SUCCEEDED;
    if (["requires_payment_method", "requires_action", "requires_confirmation"].includes(stripeStatus)) mappedStatus = PAYMENT_STATUS.PENDING;
    if (["canceled", "requires_payment_method"].includes(stripeStatus) && !(mappedStatus === PAYMENT_STATUS.SUCCEEDED)) mappedStatus = PAYMENT_STATUS.FAILED;

    // Update or create transaction record
    if (tx) {
      await FirestoreService.updateDocument(COLLECTIONS.TRANSACTIONS, tx.id, {
        status: mappedStatus,
        provider_response: intent,
        updated_at: new Date().toISOString(),
      });

      const updated = await FirestoreService.getDocument(COLLECTIONS.TRANSACTIONS, tx.id);

      // If this transaction corresponds to a wishlist contribution and succeeded,
      // update the wishlist item so collected_amount and status stay in sync.
      if (mappedStatus === PAYMENT_STATUS.SUCCEEDED) {
        const metadata = (updated as any).metadata || {};
        const wishlistItemId = metadata.wishlist_item_id as string | undefined;
        const contributionMessage = metadata.contribution_message as string | undefined;

        if (wishlistItemId) {
          // Prefer amount actually charged by provider; fall back to stored amount.
          const paidAmountCents = (intent as any).amount_received ?? (intent as any).amount ?? null;
          const paidAmount = paidAmountCents != null ? paidAmountCents / 100 : (updated as any).amount;

          if (paidAmount && paidAmount > 0) {
            try {
              await WishlistService.contributeToItem(wishlistItemId, (updated as any).user_id || undefined, {
                amount: paidAmount,
                message: contributionMessage,
              });
              logger.info("Wishlist contribution applied from payment", {
                transactionId: tx.id,
                wishlistItemId,
                amount: paidAmount,
              });
            } catch (e) {
              logger.error("Failed to apply wishlist contribution from payment", {
                transactionId: tx.id,
                wishlistItemId,
                error: e,
              });
            }
          }
        }
      }

      return {transaction: updated, intent};
    } else {
      // No transaction recorded previously - create an audit record
      const created = await FirestoreService.createDocument(COLLECTIONS.TRANSACTIONS, {
        user_id: null,
        event_id: null,
        provider: "stripe",
        provider_id: providerId,
        amount: (intent as any).amount ? ((intent as any).amount / 100) : null,
        currency: (intent as any).currency || null,
        status: mappedStatus,
        provider_response: intent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return {transaction: created, intent};
    }
  }

  /**
   * Refund payment (Stripe)
   */
  static async refundPayment(paymentIntentId: string, amount?: number) {
    if (!paymentIntentId) throw new AppError("paymentIntentId required", HTTP_STATUS.BAD_REQUEST);

    const refund = await StripeService.refundPayment(paymentIntentId, amount);

    // Update transaction record if exists
    const txs = await FirestoreService.getDocuments(COLLECTIONS.TRANSACTIONS, [
      {field: "provider_id", operator: "==", value: paymentIntentId},
    ]);

    if (txs && txs.length > 0) {
      const tx = txs[0];
      const refunds = tx.refunds || [];
      refunds.push({
        id: refund.id,
        amount: (refund.amount ?? 0) / 100,
        status: (refund.status || null),
        created_at: new Date().toISOString(),
      });

      await FirestoreService.updateDocument(COLLECTIONS.TRANSACTIONS, tx.id, {
        status: PAYMENT_STATUS.REFUNDED,
        refunds,
        updated_at: new Date().toISOString(),
      });

      const updated = await FirestoreService.getDocument(COLLECTIONS.TRANSACTIONS, tx.id);
      logger.info("Transaction refunded", {transactionId: tx.id, refundId: refund.id});
      return {transaction: updated, refund};
    } else {
      // create standalone refund audit
      const audit = await FirestoreService.createDocument(COLLECTIONS.TRANSACTIONS, {
        user_id: null,
        event_id: null,
        provider: "stripe",
        provider_id: paymentIntentId,
        amount: amount || null,
        currency: null,
        status: PAYMENT_STATUS.REFUNDED,
        refunds: [
          {
            id: refund.id,
            amount: (refund.amount ?? 0) / 100,
            status: refund.status || null,
            created_at: new Date().toISOString(),
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return {transaction: audit, refund};
    }
  }

  /**
   * List transactions with optional filters
   */
  static async listTransactions(query: Record<string, any>) {
    const filters: { field: string; operator: FirebaseFirestore.WhereFilterOp; value: any }[] = [];

    if (query.userId) filters.push({field: "user_id", operator: "==", value: query.userId});
    if (query.eventId) filters.push({field: "event_id", operator: "==", value: query.eventId});
    if (query.provider) filters.push({field: "provider", operator: "==", value: query.provider});

    const limit = query.limit ? Number(query.limit) : 50;

    const txs = await FirestoreService.getDocuments(COLLECTIONS.TRANSACTIONS, filters, undefined, limit);
    return txs;
  }
}
