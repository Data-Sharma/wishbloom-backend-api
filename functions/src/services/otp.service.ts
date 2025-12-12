import Twilio from "twilio";
import {logger} from "../utils/logger.util";
import {config} from "../config/env.config";

const accountSid = process.env.TWILIO_ACCOUNT_SID || config.twilio.accountSid;
const authToken = process.env.TWILIO_AUTH_TOKEN || config.twilio.authToken;
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || (config as any).twilioVerifyServiceSid;

if (!accountSid || !authToken || !serviceSid) {
  logger.warn("Twilio not fully configured. OTP service will fail until credentials are provided.");
}

const client = accountSid && authToken ? Twilio(accountSid, authToken) : null;

export class OTPService {
  static async sendOTP(phone: string): Promise<any> {
    if (!client) throw new Error("Twilio client not configured");
    const resp = await client.verify.services(serviceSid).verifications.create({
      to: phone,
      channel: "sms",
    });
    logger.info("OTP sent", {phone, sid: resp.sid});
    return resp;
  }

  static async verifyOTP(phone: string, code: string): Promise<boolean> {
    if (!client) throw new Error("Twilio client not configured");
    const resp = await client.verify.services(serviceSid).verificationChecks.create({
      to: phone,
      code,
    });
    logger.info("OTP verify result", {phone, status: resp.status});
    return resp.status === "approved";
  }
}
