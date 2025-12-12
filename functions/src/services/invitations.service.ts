import {FirestoreService} from "./database/firestore.service";
import {EmailService} from "./notification/email.service";
import {GuestsService} from "./guests.service";
import {EventsService} from "./events.service";
import {COLLECTIONS} from "../config/constants";
import {createNotFoundError} from "../utils/error.util";
import {logger} from "../utils/logger.util";

// AI services - adapt method names if different in your codebase
import {ContentGeneratorService} from "./ai/content-generator.service";
import {ThemeGeneratorService} from "./ai/theme-generator.service";
import {GeminiService} from "./ai/gemini.service";

interface EventInvitationData {
  templateId?: string | null;
  designData?: Record<string, any> | null;
  content?: string | null;
  imageUrl?: string | null;
  sentAt?: string | null;
}

interface GeneratePayload {
  prompt?: string;
  eventId?: string;
  styleOptions?: Record<string, any>;
  generateImage?: boolean;
}

export class InvitationsService {
  static staticTemplates() {
    return [
      {
        id: "classic-basic",
        title: "Classic Invitation",
        description: "Simple classic invitation with event details.",
        designData: {theme: "classic", colors: ["#222", "#fff"]},
        sampleContent: "You're invited to {{eventTitle}} on {{eventDate}}. Join us at {{eventLocation}}.",
      },
      {
        id: "floral",
        title: "Floral",
        description: "Bright floral-themed invitation.",
        designData: {theme: "floral", colors: ["#f9c2ff", "#fff"]},
        sampleContent: "Please join us for {{eventTitle}} — a celebration on {{eventDate}} at {{eventLocation}}.",
      },
    ];
  }

  static async listTemplates(): Promise<any[]> {
    try {
      const templates = await FirestoreService.getDocuments(COLLECTIONS.INVITATION_TEMPLATES);
      if (templates && templates.length > 0) return templates;
      return this.staticTemplates();
    } catch (error) {
      logger.warn("Failed to fetch templates from Firestore, returning static templates", error);
      return this.staticTemplates();
    }
  }

  static async generateInvitation(payload: GeneratePayload) {
    let context = "";
    if (payload.eventId) {
      try {
        const event = await EventsService.getEventById(payload.eventId);
        context = `Event: ${event.title} on ${event.eventDate} at ${event.location}. Host: ${event.hostName || event.title}.`;
      } catch (e) {
        logger.warn("Event not found while generating invitation, continuing without event context", e);
      }
    }

    const prompt = `${payload.prompt || "Create a friendly invitation message."}\n\n${context}\nStyle: ${JSON.stringify(payload.styleOptions || {})}`;

    // text
    let content = "";
    try {
      content = await ContentGeneratorService.generateInvitationText(prompt);
    } catch (err) {
      logger.warn("ContentGenerator failed; falling back to simple template", err);
      content = `You're invited! ${context}`;
    }

    // design
    let designData = {};
    try {
      designData = await ThemeGeneratorService.generateDesign(payload.styleOptions || {});
    } catch (err) {
      logger.warn("ThemeGenerator failed; using default design", err);
      designData = {theme: "default"};
    }

    // image
    let imageUrl = null;
    if (payload.generateImage) {
      try {
        const imageResult = await GeminiService.generateImage(prompt);
        imageUrl = imageResult?.url || imageResult?.imageUrl || null;
      } catch (err) {
        logger.warn("Image generation failed", err);
      }
    }

    return {
      content,
      designData,
      imageUrl,
    };
  }

  static async createOrUpdateEventInvitation(event: any, data: EventInvitationData) {
    const payload: any = {
      eventId: event.id,
      templateId: data.templateId || null,
      designData: data.designData || null,
      content: data.content || null,
      imageUrl: data.imageUrl || null,
      updated_at: new Date().toISOString(),
    };

    const existing = await FirestoreService.getDocuments(COLLECTIONS.INVITATIONS, [
      {field: "eventId", operator: "==", value: event.id},
      {field: "parentInvitationId", operator: "==", value: null},
    ]);

    if (existing && existing.length > 0) {
      const id = existing[0].id;
      await FirestoreService.updateDocument(COLLECTIONS.INVITATIONS, id, payload);
      return {id, ...existing[0], ...payload};
    }

    const created = await FirestoreService.createDocument(COLLECTIONS.INVITATIONS, {
      ...payload,
      created_at: new Date().toISOString(),
      status: "draft",
      parentInvitationId: null,
    });

    return created;
  }

  static async getEventInvitation(eventId: string) {
    const list = await FirestoreService.getDocuments(COLLECTIONS.INVITATIONS, [
      {field: "eventId", operator: "==", value: eventId},
      {field: "parentInvitationId", operator: "==", value: null},
    ]);
    if (!list || list.length === 0) throw createNotFoundError("Invitation");
    return list[0];
  }

  // new helper to fetch invitation by ID (per-guest or parent)
  static async getInvitationById(invitationId: string) {
    return FirestoreService.getDocument(COLLECTIONS.INVITATIONS, invitationId);
  }

  static async sendInvitationsToGuests(event: any, opts?: { messageOverride?: string }) {
    let invitation;
    try {
      invitation = await this.getEventInvitation(event.id);
    } catch (err) {
      invitation = await this.createOrUpdateEventInvitation(event, {
        content: `You are invited to ${event.title} on ${event.eventDate} at ${event.location}.`,
        designData: {theme: "default"},
      });
    }

    const guests = await GuestsService.listGuests(event.id);
    const sent: any[] = [];

    for (const guest of guests) {
      try {
        // Create per-guest invitation doc
        const perGuest = await FirestoreService.createDocument(COLLECTIONS.INVITATIONS, {
          eventId: event.id,
          parentInvitationId: invitation.id,
          guestId: guest.id || null,
          guestName: guest.name || null,
          guestEmail: guest.email || null,
          status: "sent",
          content: opts?.messageOverride || invitation.content || null,
          designData: invitation.designData || null,
          imageUrl: invitation.imageUrl || null,
          sentAt: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // prepare tracking URLs:
        const trackBase = `${process.env.API_BASE_URL || process.env.FUNCTIONS_BASE_URL || ""}/api/invitations/${encodeURIComponent(perGuest.id)}`;
        const trackingPixelUrl = `${trackBase}/track?action=open`;
        const redirectUrl = `${trackBase}/redirect?guestEmail=${encodeURIComponent(guest.email || "")}`;

        const rsvpLink = redirectUrl; // redirect will log click then forward to frontend

        // send email with tracking pixel embedded by EmailService
        await EmailService.sendInvitation({
          guestEmail: guest.email,
          guestName: guest.name,
          eventTitle: event.title,
          eventDate: event.eventDate,
          eventLocation: event.location,
          hostName: event.hostName || event.title,
          rsvpLink,
          imageUrl: invitation.imageUrl || undefined,
          trackingPixelUrl,
        });

        // mark delivered (best-effort)
        await FirestoreService.updateDocument(COLLECTIONS.INVITATIONS, perGuest.id, {
          status: "delivered",
          deliveredAt: new Date().toISOString(),
          rsvpLink,
          updated_at: new Date().toISOString(),
        });

        sent.push({guestId: guest.id, invitationId: perGuest.id, email: guest.email, status: "sent"});
      } catch (err) {
        logger.warn("Failed to send invitation to guest", {guest: guest.id, error: err});
        sent.push({guestId: guest.id, email: guest.email, status: "failed", error: String(err)});
      }
    }

    return {
      eventId: event.id,
      totalGuests: guests.length,
      results: sent,
      parentInvitationId: invitation.id,
    };
  }

  static async trackInvitation(invitationId: string, action: "opened" | "open" | "clicked" | "delivered", meta?: any) {
    const invitation = await FirestoreService.getDocument(COLLECTIONS.INVITATIONS, invitationId);
    if (!invitation) throw createNotFoundError("Invitation");

    const updates: any = {};
    const trackEntry = {
      action,
      at: new Date().toISOString(),
      meta: meta || null,
    };

    const existingTracks = Array.isArray(invitation.tracks) ? invitation.tracks : [];
    existingTracks.push(trackEntry);
    updates.tracks = existingTracks;

    if (action === "opened" || action === "open") updates.lastOpenedAt = new Date().toISOString();
    if (action === "clicked") updates.lastClickedAt = new Date().toISOString();
    if (action === "delivered") updates.deliveredAt = new Date().toISOString();

    updates.updated_at = new Date().toISOString();

    await FirestoreService.updateDocument(COLLECTIONS.INVITATIONS, invitationId, updates);

    return {invitationId, action, ok: true};
  }

  // keep existing resendInvitation behaviour
  static async resendInvitation(event: any, invitationId: string, message?: string) {
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
      imageUrl: invitation.imageUrl || undefined,
    });

    await FirestoreService.updateDocument(COLLECTIONS.INVITATIONS, invitationId, {
      status: "resent",
      lastResentAt: new Date().toISOString(),
      message: message || invitation.message,
      updated_at: new Date().toISOString(),
    });

    return {
      ...invitation,
      status: "resent",
      lastResentAt: new Date().toISOString(),
      message: message || invitation.message,
    };
  }
}
