import * as functions from "firebase-functions/v1";
import {logger} from "../utils/logger.util";

export const onFileUploaded = functions.storage.object().onFinalize(async (object) => {
  logger.info("File uploaded to storage", {
    bucket: object.bucket,
    name: object.name,
    contentType: object.contentType,
  });
});

export const onFileDeleted = functions.storage.object().onDelete(async (object) => {
  logger.info("File deleted from storage", {
    bucket: object.bucket,
    name: object.name,
  });
});

