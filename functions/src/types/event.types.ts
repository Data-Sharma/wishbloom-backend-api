export interface Event {
    id: string;
    hostId: string;
    title: string;
    description: string;
    eventType: EventType;
    eventDate: string;
    location: string;
    budget: number;
    guestCount: number;
    guestAcceptedCount: number;
    giftCount: number;
    status: EventStatus;
    createdAt: string;
    updatedAt: string;
  }

export type EventType =
    | "birthday"
    | "wedding"
    | "anniversary"
    | "graduation"
    | "baby_shower"
    | "retirement"
    | "other";

export type EventStatus =
    | "draft"
    | "published"
    | "ongoing"
    | "completed"
    | "cancelled";

