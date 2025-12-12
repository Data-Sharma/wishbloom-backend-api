import {Request, Response, NextFunction} from "express";
import {MemoriesService} from "../../services/memories.service";
import {sendCreated, sendNoContent, sendSuccess} from "../../utils/response.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

/* Existing CRUD handlers (list/create/update/delete) */

export const listMemories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    const memories = await MemoriesService.listMemories(eventId);
    sendSuccess(res, memories);
  } catch (error) {
    next(error);
  }
};

export const createMemory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    if (!req.user) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    const memory = await MemoriesService.createMemory(eventId, {
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags,
      visibility: req.body.visibility,
      createdBy: req.user.uid,
    });
    sendCreated(res, memory, "Memory saved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateMemory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId, memoryId} = req.params;
    await MemoriesService.updateMemory(eventId, memoryId, req.body);
    const memory = await MemoriesService.getMemory(eventId, memoryId);
    sendSuccess(res, memory, "Memory updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteMemory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId, memoryId} = req.params;
    await MemoriesService.deleteMemory(eventId, memoryId);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

/* Upload file (multipart) */
export const uploadMemoryFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    if (!req.user) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    const fileInfo = req.memoryFile;
    const createdBy = req.user.uid;

    const payload = {
      title: req.body.title as string | undefined,
      description: req.body.description as string | undefined,
      tags: req.body.tags ? (typeof req.body.tags === "string" ? JSON.parse(req.body.tags) : req.body.tags) : undefined,
      visibility: req.body.visibility as any | undefined,
      createdBy,
    };

    const memory = await MemoriesService.uploadMemory(eventId, payload, fileInfo);
    sendCreated(res, memory, "Memory uploaded successfully");
  } catch (error) {
    next(error);
  }
};

/* Download via mediaId (top-level media index) */
export const downloadMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {mediaId} = req.params;
    const url = await MemoriesService.getDownloadUrl(mediaId);
    // redirect to signed URL
    return res.redirect(302, url);
  } catch (error) {
    next(error);
  }
};
