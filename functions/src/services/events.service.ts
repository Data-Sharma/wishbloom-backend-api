import {FirestoreService} from "./database/firestore.service";
import {COLLECTIONS, EVENT_STATUS} from "../config/constants";
import {logger} from "../utils/logger.util";

export interface CreateEventData {
  title: string;
  description: string;
  eventType: string;
  eventDate: string;
  location: string;
  budget?: number;
  guestCount?: number;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  eventDate?: string;
  location?: string;
  budget?: number;
  guestCount?: number;
  status?: string;
}

/**
 * Events Service - Business logic for event management
 */
export class EventsService {
  /**
   * Create a new event
   */
  static async createEvent(
    userId: string,
    eventData: CreateEventData
  ): Promise<any> {
    try {
      const newEvent = {
        hostId: userId,
        title: eventData.title,
        description: eventData.description,
        eventType: eventData.eventType,
        eventDate: eventData.eventDate,
        location: eventData.location,
        budget: eventData.budget || 0,
        guestCount: eventData.guestCount || 0,
        status: EVENT_STATUS.DRAFT,
        guestAcceptedCount: 0,
        giftCount: 0,
      };

      const event = await FirestoreService.createDocument(
        COLLECTIONS.EVENTS,
        newEvent
      );

      logger.info("Event created", {eventId: event.id, userId});
      return event;
    } catch (error) {
      logger.error("Error creating event", error);
      throw error;
    }
  }

  /**
   * Get all events for a user
   */
  static async getUserEvents(
    userId: string,
    status?: string
  ): Promise<any[]> {
    try {
      const filters = [
        {field: "hostId", operator: "==" as const, value: userId},
      ];

      if (status) {
        filters.push({field: "status", operator: "==" as const, value: status});
      }

      const events = await FirestoreService.getDocuments(
        COLLECTIONS.EVENTS,
        filters,
        {field: "eventDate", direction: "desc"}
      );

      return events;
    } catch (error) {
      logger.error("Error getting user events", error);
      throw error;
    }
  }

  /**
   * Get event by ID
   */
  static async getEventById(eventId: string): Promise<any> {
    try {
      const event = await FirestoreService.getDocument(
        COLLECTIONS.EVENTS,
        eventId
      );

      return event;
    } catch (error) {
      logger.error("Error getting event", error);
      throw error;
    }
  }

  /**
   * Update event
   */
  static async updateEvent(
    eventId: string,
    updateData: UpdateEventData
  ): Promise<void> {
    try {
      await FirestoreService.updateDocument(
        COLLECTIONS.EVENTS,
        eventId,
        updateData
      );

      logger.info("Event updated", {eventId});
    } catch (error) {
      logger.error("Error updating event", error);
      throw error;
    }
  }

  /**
   * Delete event
   */
  static async deleteEvent(eventId: string): Promise<void> {
    try {
      await FirestoreService.deleteDocument(COLLECTIONS.EVENTS, eventId);
      logger.info("Event deleted", {eventId});
    } catch (error) {
      logger.error("Error deleting event", error);
      throw error;
    }
  }

  /**
   * Get event statistics
   */
  static async getEventStats(eventId: string): Promise<any> {
    try {
      const event = await this.getEventById(eventId);

      // Get guest list
      const guests = await FirestoreService.getSubcollection(
        COLLECTIONS.EVENTS,
        eventId,
        COLLECTIONS.GUESTS
      );

      // Get gifts
      const gifts = await FirestoreService.getSubcollection(
        COLLECTIONS.EVENTS,
        eventId,
        COLLECTIONS.GIFTS
      );

      const acceptedGuests = guests.filter((g) => g.rsvpStatus === "accepted");
      const purchasedGifts = gifts.filter((g) => g.status === "purchased");

      return {
        eventId,
        title: event.title,
        totalGuests: guests.length,
        acceptedGuests: acceptedGuests.length,
        declinedGuests: guests.filter((g) => g.rsvpStatus === "declined").length,
        totalGifts: gifts.length,
        purchasedGifts: purchasedGifts.length,
        giftValue: purchasedGifts.reduce((sum, gift) => sum + (gift.price || 0), 0),
        eventDate: event.eventDate,
        status: event.status,
      };
    } catch (error) {
      logger.error("Error getting event stats", error);
      throw error;
    }
  }

  /**
   * Get list of supported event types
   */
  static getEventTypes(): string[] {
    return [
      "birthday",
      "wedding",
      "anniversary",
      "graduation",
      "baby_shower",
      "retirement",
      "other",
    ];
  }

  /**
   * Get event settings (subset of event fields)
   */
  static async getEventSettings(eventId: string): Promise<any> {
    const event = await this.getEventById(eventId);
    return {
      eventDate: event.eventDate,
      location: event.location,
      budget: event.budget,
      guestCount: event.guestCount,
      status: event.status,
    };
  }

  /**
   * Update event settings and return updated settings
   */
  static async updateEventSettings(
    eventId: string,
    settings: Partial<UpdateEventData>
  ): Promise<any> {
    await this.updateEvent(eventId, settings);
    return this.getEventSettings(eventId);
  }
}
