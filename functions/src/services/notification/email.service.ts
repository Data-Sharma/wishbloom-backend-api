import sgMail from "@sendgrid/mail";
import {config} from "../../config/env.config";
import {logger} from "../../utils/logger.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

const isValidSendgridKey = (key?: string | null): key is string =>
  typeof key === "string" && key.startsWith("SG.");

if (isValidSendgridKey(config.sendgridApiKey)) {
  sgMail.setApiKey(config.sendgridApiKey);
} else {
  logger.warn("SendGrid API key missing or invalid (must start with \"SG.\"). Email sending disabled.");
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface InvitationEmailData {
  guestEmail: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  hostName: string;
  rsvpLink: string;
}

/**
 * Email Service using SendGrid
 */
export class EmailService {
  private static readonly FROM_EMAIL = config.sendgrid?.fromEmail || "noreply@wishbloom.com";
  private static readonly FROM_NAME = config.sendgrid?.fromName || "WishBloom";

  /**
   * Send a generic email
   */
  static async sendEmail(data: EmailData): Promise<void> {
    try {
      if (!isValidSendgridKey(config.sendgridApiKey)) {
        throw new AppError(
          "SendGrid API key not configured. Set SENDGRID_API_KEY before sending email.",
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }

      const msg = {
        to: data.to,
        from: {
          email: this.FROM_EMAIL,
          name: this.FROM_NAME,
        },
        subject: data.subject,
        text: data.text || "",
        html: data.html,
      };

      await sgMail.send(msg);
      logger.info("Email sent", {to: data.to, subject: data.subject});
    } catch (error) {
      logger.error("Error sending email", error);
      throw new AppError("Failed to send email", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Send event invitation email
   */
  static async sendInvitation(data: InvitationEmailData): Promise<void> {
    try {
      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #32b8c6; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background: #32b8c6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You're Invited! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi ${data.guestName},</p>
      <p>${data.hostName} has invited you to celebrate:</p>
      <h2>${data.eventTitle}</h2>
      <p><strong>When:</strong> ${data.eventDate}</p>
      <p><strong>Where:</strong> ${data.eventLocation}</p>
      <p>We'd love to have you join us for this special occasion!</p>
      <a href="${data.rsvpLink}" class="button">RSVP Now</a>
      <p>Looking forward to celebrating with you!</p>
    </div>
    <div class="footer">
      <p>This invitation was sent via WishBloom</p>
    </div>
  </div>
</body>
</html>
      `;

      await this.sendEmail({
        to: data.guestEmail,
        subject: `You're invited: ${data.eventTitle}`,
        html,
      });
    } catch (error) {
      logger.error("Error sending invitation", error);
      throw error;
    }
  }

  /**
   * Send RSVP confirmation email
   */
  static async sendRSVPConfirmation(
    guestEmail: string,
    guestName: string,
    eventTitle: string,
    rsvpStatus: string
  ): Promise<void> {
    try {
      const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>RSVP Confirmed</h2>
    <p>Hi ${guestName},</p>
    <p>Thank you for responding to the invitation for <strong>${eventTitle}</strong>.</p>
    <p>Your response: <strong>${rsvpStatus.toUpperCase()}</strong></p>
    ${rsvpStatus === "accepted" ? "<p>We look forward to seeing you there! 🎉</p>" : "<p>We'll miss you, but thanks for letting us know.</p>"}
    <p>Best regards,<br>WishBloom Team</p>
  </div>
</body>
</html>
      `;

      await this.sendEmail({
        to: guestEmail,
        subject: `RSVP Confirmation - ${eventTitle}`,
        html,
      });
    } catch (error) {
      logger.error("Error sending RSVP confirmation", error);
      throw error;
    }
  }

  /**
   * Send event reminder email
   */
  static async sendEventReminder(
    guestEmail: string,
    guestName: string,
    eventTitle: string,
    eventDate: string,
    eventLocation: string,
    daysUntilEvent: number
  ): Promise<void> {
    try {
      const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Event Reminder 📅</h2>
    <p>Hi ${guestName},</p>
    <p>Just a friendly reminder about the upcoming event:</p>
    <h3>${eventTitle}</h3>
    <p><strong>Date:</strong> ${eventDate} (in ${daysUntilEvent} days)</p>
    <p><strong>Location:</strong> ${eventLocation}</p>
    <p>See you there!</p>
    <p>Best regards,<br>WishBloom Team</p>
  </div>
</body>
</html>
      `;

      await this.sendEmail({
        to: guestEmail,
        subject: `Reminder: ${eventTitle} is coming up!`,
        html,
      });
    } catch (error) {
      logger.error("Error sending event reminder", error);
      throw error;
    }
  }

  /**
   * Send gift purchase confirmation
   */
  static async sendGiftConfirmation(
    guestEmail: string,
    guestName: string,
    giftName: string,
    eventTitle: string,
    amount: number
  ): Promise<void> {
    try {
      const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Gift Purchase Confirmed 🎁</h2>
    <p>Hi ${guestName},</p>
    <p>Thank you for your generous gift!</p>
    <p><strong>Gift:</strong> ${giftName}</p>
    <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
    <p><strong>Event:</strong> ${eventTitle}</p>
    <p>Your thoughtfulness is greatly appreciated!</p>
    <p>Best regards,<br>WishBloom Team</p>
  </div>
</body>
</html>
      `;

      await this.sendEmail({
        to: guestEmail,
        subject: `Gift Confirmation - ${eventTitle}`,
        html,
      });
    } catch (error) {
      logger.error("Error sending gift confirmation", error);
      throw error;
    }
  }
}
