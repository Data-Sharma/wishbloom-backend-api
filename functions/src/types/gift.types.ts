export interface Gift {
    id: string;
    eventId: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    status: GiftStatus;
    purchasedBy?: string;
    purchaserName?: string;
    purchaserEmail?: string;
    createdAt: string;
    updatedAt: string;
  }

export type GiftStatus =
    | "available"
    | "reserved"
    | "purchased";

