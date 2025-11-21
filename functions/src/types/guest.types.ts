export interface Guest {
    id: string;
    eventId: string;
    name: string;
    email: string;
    phone?: string;
    rsvpStatus: RSVPStatus;
    plusOne?: number;
    dietaryRestrictions?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }

export type RSVPStatus =
    | "pending"
    | "accepted"
    | "declined"
    | "maybe";

