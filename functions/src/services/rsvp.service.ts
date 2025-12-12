import {FirestoreService} from "./database/firestore.service";
import {GuestsService} from "./guests.service";
import {COLLECTIONS, RSVP_STATUS} from "../config/constants";
import {createNotFoundError} from "../utils/error.util";

export class RsvpService {
  /**
   * View invitation (guest opens link)
   */
  static async viewInvitation(invitationId: string): Promise<any> {
    const invitation = await FirestoreService.getDocument(
      COLLECTIONS.INVITATIONS,
      invitationId
    );

    if (!invitation) throw createNotFoundError("Invitation");

    return invitation;
  }

  /**
   * Submit RSVP for a guest
   */
  static async submitRsvp(invitationId: string, status: string, message?: string): Promise<any> {
    const invitation = await FirestoreService.getDocument(
      COLLECTIONS.INVITATIONS,
      invitationId
    );

    if (!invitation) throw createNotFoundError("Invitation");

    // Find guest by email inside event's guest subcollection
    const guests = await FirestoreService.getSubcollection(
      COLLECTIONS.EVENTS,
      invitation.eventId,
      COLLECTIONS.GUESTS
    );

    const guest = guests.find((g) => g.email === invitation.guestEmail);

    if (!guest) throw createNotFoundError("Guest");

    return GuestsService.updateGuestRSVP(invitation.eventId, guest.id, status, message);
  }

  /**
   * Update RSVP (same as submit — but explicit API)
   */
  static async updateRsvp(invitationId: string, status: string, message?: string): Promise<any> {
    return this.submitRsvp(invitationId, status, message);
  }

  /**
   * RSVP Summary for hosts
   */
  static async getRsvpSummary(eventId: string): Promise<any> {
    const guests = await FirestoreService.getSubcollection(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.GUESTS
    );

    const counts = {
      accepted: 0,
      declined: 0,
      maybe: 0,
      pending: 0,
    };

    guests.forEach((guest) => {
      switch (guest.rsvpStatus) {
      case RSVP_STATUS.ACCEPTED:
        counts.accepted++;
        break;
      case RSVP_STATUS.DECLINED:
        counts.declined++;
        break;
      case RSVP_STATUS.MAYBE:
        counts.maybe++;
        break;
      default:
        counts.pending++;
      }
    });

    return counts;
  }
}
