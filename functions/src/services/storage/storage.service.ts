import {storage} from "../../config/firebase.config";
import {logger} from "../../utils/logger.util";

const bucket = storage.bucket();

export class StorageService {
  static getBucketName(): string {
    return bucket.name;
  }

  static async uploadBuffer(
    destination: string,
    buffer: Buffer,
    contentType?: string
  ): Promise<string> {
    const file = bucket.file(destination);
    await file.save(buffer, {
      contentType,
      resumable: false,
      public: false,
    });
    logger.info("File uploaded to storage", {destination});
    return destination;
  }

  static async uploadFileFromPath(source: string, destination: string, contentType?: string): Promise<string> {
    const [file] = await bucket.upload(source, {
      destination,
      metadata: {
        contentType,
      },
      public: false,
    });
    logger.info("File uploaded from path", {destination});
    return file.name;
  }

  static async deleteFile(path: string): Promise<void> {
    await bucket.file(path).delete({ignoreNotFound: true});
    logger.info("File deleted from storage", {path});
  }

  static async generateSignedUrl(path: string, expiresInSeconds = 3600): Promise<string> {
    const file = bucket.file(path);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + expiresInSeconds * 1000,
    });
    return url;
  }
}
