import fetch from "node-fetch";
import {config} from "../config/env.config";
import {logger} from "../utils/logger.util";
import {AppError} from "../utils/error.util";
import {HTTP_STATUS} from "../config/constants";

const getRestUrl = (path: string) => {
  const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const apiKey = config.identityToolkitApiKey || config.firebaseWebApiKey || process.env.FIREBASE_WEB_API_KEY;
  if (emulatorHost) {
    // When emulator is present, use emulator base (emulator proxies identitytoolkit)
    return `http://${emulatorHost}/identitytoolkit.googleapis.com/v1/${path}?key=${apiKey || "demo-api-key"}`;
  }
  if (!apiKey) {
    logger.error("Identity Toolkit API key missing");
    throw new AppError("Authentication service is not configured", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
  return `https://identitytoolkit.googleapis.com/v1/${path}?key=${apiKey}`;
};

export class IdentityService {
  static async sendPasswordResetEmail(email: string) {
    const url = getRestUrl("accounts:sendOobCode");
    const resp = await fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({requestType: "PASSWORD_RESET", email}),
    });
    const payload = await resp.json();
    if (!resp.ok) {
      logger.warn("sendPasswordResetEmail failed", {email, payload});
      throw new AppError("Unable to send password reset email", HTTP_STATUS.BAD_REQUEST);
    }
    return payload;
  }

  static async resetPassword(oobCode: string, newPassword: string) {
    const url = getRestUrl("accounts:resetPassword");
    const resp = await fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({oobCode, newPassword}),
    });
    const payload = await resp.json();
    if (!resp.ok) {
      logger.warn("resetPassword failed", {oobCode, payload});
      throw new AppError("Unable to reset password", HTTP_STATUS.BAD_REQUEST);
    }
    return payload;
  }

  static async refreshToken(refreshToken: string) {
    // securetoken endpoint is separate and uses different host
    const apiKey = config.identityToolkitApiKey || config.firebaseWebApiKey || process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey) throw new AppError("Authentication service not configured", HTTP_STATUS.INTERNAL_SERVER_ERROR);

    const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;
    const body = new URLSearchParams();
    body.append("grant_type", "refresh_token");
    body.append("refresh_token", refreshToken);

    const resp = await fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: body.toString(),
    });

    const payload = await resp.json();
    if (!resp.ok) {
      logger.warn("refreshToken failed", {payload});
      throw new AppError("Unable to refresh token", HTTP_STATUS.BAD_REQUEST);
    }

    return payload; // contains id_token, refresh_token, expires_in, user_id, etc.
  }
}
