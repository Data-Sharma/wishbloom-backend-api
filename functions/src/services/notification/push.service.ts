import {admin} from "../../config/firebase.config";
import {logger} from "../../utils/logger.util";

export interface PushMessage {
  title: string;
  body: string;
}

export class PushNotificationService {
  static async sendToToken(token: string, message: PushMessage, data?: Record<string, string>): Promise<void> {
    await admin.messaging().send({
      token,
      notification: {
        title: message.title,
        body: message.body,
      },
      data,
    });
    logger.info("Push notification sent", {token});
  }

  static async sendToTopic(topic: string, message: PushMessage, data?: Record<string, string>): Promise<void> {
    await admin.messaging().send({
      topic,
      notification: {
        title: message.title,
        body: message.body,
      },
      data,
    });
    logger.info("Push notification sent to topic", {topic});
  }
}
