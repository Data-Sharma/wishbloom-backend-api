import {Request, Response, NextFunction} from "express";
import * as BusboyFactory from "busboy";
import {AppError} from "../utils/error.util";
import {HTTP_STATUS} from "../config/constants";
import {v4 as uuidv4} from "uuid";

export const uploadMedia = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const contentType = (req.headers["content-type"] || "") as string;
    if (!contentType.includes("multipart/form-data")) {
      // No multipart — just continue (text-only request)
      return next();
    }

    const busboy = BusboyFactory.default({headers: req.headers});
    const chunks: Buffer[] = [];
    let fileSeen = false;
    let fileMime = "";
    let fileField = "";

    busboy.on("file", (fieldname: string, file: NodeJS.ReadableStream, info: { filename: string; mimeType: string }) => {
      // accept 'file' or 'image' or 'media'
      if (!["file", "image", "media"].includes(fieldname)) {
        // skip unexpected fields
        file.resume();
        return;
      }

      fileSeen = true;
      fileField = fieldname;
      fileMime = info.mimeType || "application/octet-stream";

      file.on("data", (data: Buffer) => {
        chunks.push(data);
      });

      file.on("error", (err: Error) => {
        return next(new AppError(`Error reading uploaded file: ${err.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR));
      });
    });

    busboy.on("error", (err: Error) => {
      return next(new AppError(`Error processing upload: ${err.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    });

    busboy.on("finish", () => {
      if (!fileSeen) {
        // no file — proceed
        return next();
      }

      const buffer = Buffer.concat(chunks);

      // limit to 10MB by default (adjust if needed)
      if (buffer.length > 10 * 1024 * 1024) {
        return next(new AppError("Uploaded file exceeds 10MB limit", HTTP_STATUS.BAD_REQUEST));
      }

      // attach to request for controllers to use
      (req as any).fileBuffer = buffer;
      (req as any).fileMime = fileMime;
      (req as any).fileField = fileField;
      (req as any).fileId = `uploads/${uuidv4()}`;

      return next();
    });

    req.pipe(busboy);
  } catch (err) {
    return next(err as any);
  }
};
