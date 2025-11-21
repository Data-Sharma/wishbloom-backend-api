import {FirestoreService} from "./database/firestore.service";
import {EmailService} from "./notification/email.service";
import {config} from "../config/env.config";
import {COLLECTIONS} from "../config/constants";
import {createNotFoundError} from "../utils/error.util";

interface InvitationPayload {
  guestName: string;
  guestEmail: string;
  message?: string;
  rsvpLink?: string;
}

export class InvitationsService {
  static async listInvitations(eventId: string): Promise<any[]> {
    return FirestoreService.getDocuments(COLLECTIONS.INVITATIONS, [
      {field: "eventId", operator: "==" as const, value: eventId},
    ]);
  }

  static async createInvitation(event: any, payload: InvitationPayload): Promise<any> {
    const invitation = await FirestoreService.createDocument(COLLECTIONS.INVITATIONS, {
      eventId: event.id,
      guestName: payload.guestName,
      guestEmail: payload.guestEmail,
      status: "sent",
      message: payload.message,
      rsvpLink:
        payload.rsvpLink || `${config.frontendUrl || "http://localhost:5173"}/events/${event.id}`,
      sentAt: new Date().toISOString(),
    });

    await EmailService.sendInvitation({
      guestEmail: payload.guestEmail,
      guestName: payload.guestName,
      eventTitle: event.title,
      eventDate: event.eventDate,
      eventLocation: event.location,
      hostName: event.hostName || event.title,
      rsvpLink: invitation.rsvpLink,
    });

    return invitation;
  }

  static async resendInvitation(event: any, invitationId: string, message?: string): Promise<any> {
    const invitation = await FirestoreService.getDocument(COLLECTIONS.INVITATIONS, invitationId);

    if (invitation.eventId !== event.id) {
      throw createNotFoundError("Invitation");
    }

    await EmailService.sendInvitation({
      guestEmail: invitation.guestEmail,
      guestName: invitation.guestName,
      eventTitle: event.title,
      eventDate: event.eventDate,
      eventLocation: event.location,
      hostName: event.hostName || event.title,
      rsvpLink: invitation.rsvpLink,
    });

    await FirestoreService.updateDocument(COLLECTIONS.INVITATIONS, invitationId, {
      status: "resent",
      lastResentAt: new Date().toISOString(),
      message: message || invitation.message,
    });

    return {
      ...invitation,
      status: "resent",
      lastResentAt: new Date().toISOString(),
      message: message || invitation.message,
    };
  }
}
