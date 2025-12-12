import {Request, Response, NextFunction} from "express";
import {v4 as uuidv4} from "uuid";
import * as BusboyFactory from "busboy";
import {AppError} from "../utils/error.util";
import {HTTP_STATUS} from "../config/constants";

interface MemoryFileInfo {
  buffer: Buffer;
  mimetype: string;
  fileName: string; // storage path
  originalName: string;
  size: number;
  mediaType: "image" | "video" | "other";
}

declare global {
  namespace Express {
    interface Request {
      memoryFile?: MemoryFileInfo;
    }
  }
}

const IMAGE_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const VIDEO_MIMES = ["video/mp4"];

export const uploadMemoryFile = (fieldName = "file") => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const contentType = (req.headers["content-type"] || "") as string;
      if (!contentType.includes("multipart/form-data")) {
        // allow requests that are metadata-only (notes) — they won't include multipart
        return next();
      }

      const busboy = BusboyFactory.default({headers: req.headers});
      const chunks: Buffer[] = [];
      let fileSeen = false;
      let mimetype = "";
      let originalName = "";
      let fileName = "";
      let size = 0;

      busboy.on("file", (fName: string, file: NodeJS.ReadableStream, info: { filename: string; mimeType: string }) => {
        if (fName !== fieldName) {
          file.resume();
          return;
        }

        const {filename, mimeType} = info;
        fileSeen = true;
        mimetype = mimeType;
        originalName = filename;

        const ext = filename.split(".").pop() || (mimetype.startsWith("image/") ? "jpg" : "bin");
        // e.g. events/{eventId}/memories/<uuid>-<timestamp>.<ext>
        const eventId = (req.params && (req.params as any).eventId) || "unknown-event";
        fileName = `events/${eventId}/memories/${uuidv4()}-${Date.now()}.${ext}`;

        file.on("data", (data: Buffer) => {
          chunks.push(data);
          size += data.length;
          // Note: you set FileSize: D (no limit). If you want limits later, enforce here.
        });

        file.on("error", (err: Error) => {
          return next(new AppError(`Error reading uploaded file: ${err.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR));
        });
      });

      busboy.on("error", (err: Error) => next(new AppError(`Error processing file upload: ${err.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR)));

      busboy.on("finish", () => {
        if (!fileSeen) {
          // no file uploaded — treat as metadata-only request
          return next();
        }

        const buffer = Buffer.concat(chunks);

        const mediaType = IMAGE_MIMES.includes(mimetype.toLowerCase()) ?
          "image" :
          VIDEO_MIMES.includes(mimetype.toLowerCase()) ?
            "video" :
            "other";

        req.memoryFile = {
          buffer,
          mimetype,
          fileName,
          originalName,
          size,
          mediaType,
        };

        (req as any).fileBuffer = buffer;
        (req as any).fileMime = mimetype;

        return next();
      });

      req.pipe(busboy);
    } catch (err) {
      return next(err);
    }
  };
};
