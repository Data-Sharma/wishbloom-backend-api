import {FirestoreService} from "../database/firestore.service";
import {COLLECTIONS} from "../../config/constants";
import {logger} from "../../utils/logger.util";
import {searchEcommerceProducts} from "../ecommerce/ecommerceProvider.service";

/**
 * Wishlist architecture:
 * - wishlists (top-level) store event -> wishlist mapping and metadata
 * - wishlistItems (top-level) store items with wishlist_id and event_id so items are addressable by itemId directly
 * - wishlistContributions (top-level) store contribution records for audit/history
 *
 * Note: contributions update item.collected_amount and push contributor id. This implementation reads current value then updates.
 * For production, use Firestore transactions to avoid race conditions.
 */

export class WishlistService {
  static async createWishlist(eventId: string, data: any, createdBy?: string) {
    const payload = {
      event_id: eventId,
      title: data.title || null,
      description: data.description || null,
      created_by: createdBy || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await FirestoreService.createDocument(COLLECTIONS.WISHLISTS, payload);
    logger.info("Wishlist created", {wishlistId: saved.id, eventId});
    return saved;
  }

  static async getWishlistByEvent(eventId: string) {
    // find wishlist for event
    const lists = await FirestoreService.getDocuments(COLLECTIONS.WISHLISTS, [
      {field: "event_id", operator: "==", value: eventId},
    ]);
    const wishlist = lists && lists.length > 0 ? lists[0] : null;
    if (!wishlist) return null;
    // fetch items
    const items = await FirestoreService.getDocuments(COLLECTIONS.WISHLIST_ITEMS, [
      {field: "wishlist_id", operator: "==", value: wishlist.id},
    ]);
    return {...wishlist, items: items || []};
  }

  static async addItem(wishlistId: string, eventId: string, data: any, createdBy?: string) {
    const payload = {
      wishlist_id: wishlistId,
      event_id: eventId,
      item_name: data.item_name,
      description: data.description || null,
      price: data.price,
      product_link: data.product_link || null,
      affiliate_link: data.affiliate_link || null,
      image_url: data.image_url || null,
      target_amount: data.target_amount ?? null,
      collected_amount: 0,
      contributors: [],
      status: "available",
      created_by: createdBy || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await FirestoreService.createDocument(COLLECTIONS.WISHLIST_ITEMS, payload);
    logger.info("Wishlist item added", {itemId: saved.id, wishlistId, eventId});
    return saved;
  }

  static async updateItem(itemId: string, updates: any) {
    // update top-level wishlist item doc
    await FirestoreService.updateDocument(COLLECTIONS.WISHLIST_ITEMS, itemId, updates);
    return await FirestoreService.getDocument(COLLECTIONS.WISHLIST_ITEMS, itemId);
  }

  static async deleteItem(itemId: string) {
    await FirestoreService.deleteDocument(COLLECTIONS.WISHLIST_ITEMS, itemId);
  }

  static async contributeToItem(itemId: string, userId: string | undefined, contribution: { amount: number; message?: string }) {
    // read item
    const item = await FirestoreService.getDocument(COLLECTIONS.WISHLIST_ITEMS, itemId);

    // update collected_amount and contributors (non-atomic). For production use transactions.
    const newCollected = (Number(item.collected_amount || 0) + Number(contribution.amount));
    const contributors = item.contributors || [];
    const contributorEntry = {
      userId: userId || null,
      amount: contribution.amount,
      message: contribution.message || null,
      created_at: new Date().toISOString(),
    };
    contributors.push(contributorEntry);

    await FirestoreService.updateDocument(COLLECTIONS.WISHLIST_ITEMS, itemId, {
      collected_amount: newCollected,
      contributors,
    });

    // create contribution audit record
    const contribPayload = {
      wishlist_item_id: itemId,
      user_id: userId || null,
      amount: contribution.amount,
      message: contribution.message || null,
      created_at: new Date().toISOString(),
    };
    const savedContribution = await FirestoreService.createDocument(COLLECTIONS.WISHLIST_CONTRIBUTIONS, contribPayload);

    // Optionally compute status
    const status = item.target_amount && newCollected >= item.target_amount ? "funded" : item.status || "available";
    if (status !== item.status) {
      await FirestoreService.updateDocument(COLLECTIONS.WISHLIST_ITEMS, itemId, {status});
    }

    logger.info("Contribution recorded", {itemId, contributionId: savedContribution.id, userId});
    return {contribution: savedContribution, item: await FirestoreService.getDocument(COLLECTIONS.WISHLIST_ITEMS, itemId)};
  }

  static async purchaseItem(itemId: string, purchaser: { name: string; email?: string }) {
    // mark item as purchased and record purchaser info
    await FirestoreService.updateDocument(COLLECTIONS.WISHLIST_ITEMS, itemId, {
      status: "purchased",
      purchaser_name: purchaser.name,
      purchaser_email: purchaser.email || null,
      updated_at: new Date().toISOString(),
    });

    const item = await FirestoreService.getDocument(COLLECTIONS.WISHLIST_ITEMS, itemId);
    logger.info("Wishlist item purchased", {itemId, purchaser: purchaser.name});
    return item;
  }

  // Simple placeholder for ecommerce search - implement provider integration later
  static async searchEcommerce(query: string) {
    // Delegate to pluggable ecommerce provider layer
    const result = await searchEcommerceProducts(query, {
      limit: 20,
    });
    return result;
  }
}
