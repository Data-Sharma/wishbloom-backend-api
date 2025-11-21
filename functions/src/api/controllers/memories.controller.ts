import {Request, Response, NextFunction} from "express";
import {MemoriesService} from "../../services/memories.service";
import {EventsService} from "../../services/events.service";
import {sendCreated, sendNoContent, sendSuccess} from "../../utils/response.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

const ensureEventOwnership = async (req: Request, eventId: string) => {
  if (!req.user) {
    throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
  }

  const event = await EventsService.getEventById(eventId);
  if (event.hostId !== req.user.uid) {
    throw new AppError("Unauthorized to manage memories for this event", HTTP_STATUS.FORBIDDEN);
  }

  return event;
};

export const listMemories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    await ensureEventOwnership(req, eventId);
    const memories = await MemoriesService.listMemories(eventId);
    sendSuccess(res, memories);
  } catch (error) {
    next(error);
  }
};

export const createMemory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    await ensureEventOwnership(req, eventId);
    const memory = await MemoriesService.createMemory(eventId, {
      ...req.body,
      createdBy: req.user!.uid,
    });
    sendCreated(res, memory, "Memory saved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateMemory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId, memoryId} = req.params;
    await ensureEventOwnership(req, eventId);
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
    await ensureEventOwnership(req, eventId);
    await MemoriesService.deleteMemory(eventId, memoryId);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};
