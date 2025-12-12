export type NotificationType = "system" | "quote" | "booking" | "reminder" | "general";

export interface Notification {
  id?: string;
  userId: string; // recipient userId
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>; // optional extra payload
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationPreference {
  userId: string;
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
