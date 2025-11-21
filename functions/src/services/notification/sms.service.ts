import twilio, {Twilio} from "twilio";
import {config} from "../../config/env.config";
import {logger} from "../../utils/logger.util";

let client: Twilio | null = null;

if (config.twilio?.accountSid && config.twilio?.authToken) {
  client = twilio(config.twilio.accountSid, config.twilio.authToken);
}

export class SmsService {
  static async sendSMS(to: string, message: string): Promise<void> {
    if (!client || !config.twilio?.phoneNumber) {
      logger.warn("Twilio configuration missing, SMS not sent");
      return;
    }

    await client.messages.create({
      to,
      from: config.twilio.phoneNumber,
      body: message,
    });

    logger.info("SMS sent", {to});
  }
}
