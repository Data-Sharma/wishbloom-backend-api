import {FirestoreService} from "./database/firestore.service";
import {EmailService} from "./notification/email.service";
import {EventsService} from "./events.service";
import {COLLECTIONS, RSVP_STATUS} from "../config/constants";
import {logger} from "../utils/logger.util";

export interface GuestData {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  notes?: string;
  rsvpStatus?: string;
  metadata?: Record<string, any>;
}

export class GuestsService {
  static async listGuests(eventId: string, status?: string, search?: string): Promise<any[]> {
    const filters = status ?
      [{field: "rsvpStatus", operator: "==" as const, value: status}] :
      undefined;

    const guests = await FirestoreService.getSubcollection(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.GUESTS,
      filters
    );

    if (search) {
      const term = search.toLowerCase();
      return guests.filter(
        (guest) =>
          guest.name?.toLowerCase().includes(term) ||
          guest.email?.toLowerCase().includes(term)
      );
    }

    return guests;
  }

  static async addGuest(eventId: string, data: GuestData): Promise<any> {
    const guest = await FirestoreService.createSubcollectionDocument(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.GUESTS,
      {
        ...data,
        rsvpStatus: data.rsvpStatus || RSVP_STATUS.PENDING,
      }
    );

    logger.info("Guest added", {eventId, guestId: guest.id});
    return guest;
  }

  static async getGuest(eventId: string, guestId: string): Promise<any> {
    return FirestoreService.getSubcollectionDocument(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.GUESTS,
      guestId
    );
  }

  static async updateGuest(eventId: string, guestId: string, data: Partial<GuestData>): Promise<void> {
    await FirestoreService.updateSubcollectionDocument(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.GUESTS,
      guestId,
      data
    );
  }

  static async removeGuest(eventId: string, guestId: string): Promise<void> {
    await FirestoreService.deleteSubcollectionDocument(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.GUESTS,
      guestId
    );
  }

  static async updateGuestRSVP(eventId: string, guestId: string, status: string, message?: string): Promise<any> {
    await FirestoreService.updateSubcollectionDocument(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.GUESTS,
      guestId,
      {
        rsvpStatus: status,
        rsvpMessage: message,
        respondedAt: new Date().toISOString(),
      }
    );

    const [guest, event] = await Promise.all([
      this.getGuest(eventId, guestId),
      EventsService.getEventById(eventId),
    ]);
    try {
    await EmailService.sendRSVPConfirmation(guest.email, guest.name, event.title, status);
    } catch (error){
      logger.warn("RSVP email failed but RSVP stored successfully,{error}")
    }
    return guest;
  }
}

