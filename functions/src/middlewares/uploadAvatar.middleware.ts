import {Request, Response, NextFunction} from "express";
import {v4 as uuidv4} from "uuid";
import * as BusboyFactory from "busboy";
import {AppError} from "../utils/error.util";
import {HTTP_STATUS} from "../config/constants";

interface FileInfo {
  buffer: Buffer;
  mimetype: string;
  fileName: string;
  originalName: string;
}

declare global {
  namespace Express {
    interface Request {
      fileInfo?: FileInfo;
    }
  }
}

export const uploadAvatar = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const contentType = (req.headers["content-type"] || "") as string;
    if (!contentType.includes("multipart/form-data")) {
      return next(new AppError("Content-Type must be multipart/form-data", HTTP_STATUS.BAD_REQUEST));
    }

    const busboy = BusboyFactory.default({headers: req.headers});
    const chunks: Buffer[] = [];
    let fileSeen = false;
    let mimetype = "";
    let originalName = "";
    let fileName = "";

    busboy.on("file", (fieldname: string, file: NodeJS.ReadableStream, info: { filename: string; mimeType: string }) => {
      if (fieldname !== "avatar") {
        file.resume();
        return;
      }

      const {filename, mimeType} = info;
      fileSeen = true;
      mimetype = mimeType;
      originalName = filename;
      const ext = filename.split(".").pop() || "png";
      fileName = `avatars/${uuidv4()}-${Date.now()}.${ext}`;

      file.on("data", (data: Buffer) => {
        chunks.push(data);
      });

      file.on("error", (err: Error) => {
        return next(new AppError(`Error reading uploaded file: ${err.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR));
      });
    });

    busboy.on("error", (err: Error) =>
      next(new AppError(`Error processing file upload: ${err.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR))
    );

    busboy.on("finish", () => {
      if (!fileSeen) {
        return next(new AppError("No avatar file provided", HTTP_STATUS.BAD_REQUEST));
      }

      const buffer = Buffer.concat(chunks);
      if (buffer.length > 5 * 1024 * 1024) {
        return next(new AppError("File size exceeds 5MB limit", HTTP_STATUS.BAD_REQUEST));
      }

      if (!mimetype.startsWith("image/")) {
        return next(new AppError("Only image files are allowed", HTTP_STATUS.BAD_REQUEST));
      }

      req.fileInfo = {
        buffer,
        mimetype,
        fileName,
        originalName,
      };

      return next();
    });

    req.pipe(busboy);
  } catch (err) {
    return next(err);
  }
};

export const processAvatar = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.fileInfo) {
    return next(new AppError("No file information available", HTTP_STATUS.BAD_REQUEST));
  }
  return next();
};
