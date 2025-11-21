import {FirestoreService} from "./database/firestore.service";
import {EmailService} from "./notification/email.service";
import {EventsService} from "./events.service";
import {COLLECTIONS, GIFT_STATUS} from "../config/constants";
import {logger} from "../utils/logger.util";

export interface GiftData {
  name: string;
  description?: string;
  price: number;
  link?: string;
  imageUrl?: string;
  status?: string;
}

export class GiftsService {
  static async listGifts(eventId: string): Promise<any[]> {
    return FirestoreService.getSubcollection(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.GIFTS
    );
  }

  static async addGift(eventId: string, data: GiftData): Promise<any> {
    const gift = await FirestoreService.createSubcollectionDocument(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.GIFTS,
      {
        ...data,
        status: data.status || GIFT_STATUS.AVAILABLE,
      }
    );

    logger.info("Gift added", {eventId, giftId: gift.id});
    return gift;
  }

  static async getGift(eventId: string, giftId: string): Promise<any> {
    return FirestoreService.getSubcollectionDocument(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.GIFTS,
      giftId
    );
  }

  static async updateGift(eventId: string, giftId: string, data: Partial<GiftData>): Promise<void> {
    await FirestoreService.updateSubcollectionDocument(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.GIFTS,
      giftId,
      data
    );
  }

  static async removeGift(eventId: string, giftId: string): Promise<void> {
    await FirestoreService.deleteSubcollectionDocument(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.GIFTS,
      giftId
    );
  }

  static async updateGiftStatus(
    eventId: string,
    giftId: string,
    data: { status: string; purchaserName?: string; purchaserEmail?: string }
  ): Promise<any> {
    await FirestoreService.updateSubcollectionDocument(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.GIFTS,
      giftId,
      {
        status: data.status,
        purchaserName: data.purchaserName,
        purchaserEmail: data.purchaserEmail,
        updatedAt: new Date().toISOString(),
      }
    );

    const [gift, event] = await Promise.all([
      this.getGift(eventId, giftId),
      EventsService.getEventById(eventId),
    ]);

    if (gift.status === GIFT_STATUS.PURCHASED && gift.purchaserEmail) {
      await EmailService.sendGiftConfirmation(
        gift.purchaserEmail,
        gift.purchaserName || "Guest",
        gift.name,
        event.title,
        gift.price || 0
      );
    }

    return gift;
  }
}
