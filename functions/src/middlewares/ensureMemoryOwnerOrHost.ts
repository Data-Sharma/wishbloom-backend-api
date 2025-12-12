import {Request, Response, NextFunction} from "express";
import {AppError} from "../utils/error.util";
import {HTTP_STATUS, COLLECTIONS} from "../config/constants";
import {FirestoreService} from "../services/database/firestore.service";


export const ensureMemoryOwnerOrHost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {eventId, memoryId} = req.params;
    const user = req.user;

    if (!user) {
      throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
    }

    // Get the memory
    const memory = await FirestoreService.getSubcollectionDocument(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.MEMORIES,
      memoryId
    );

    if (!memory) {
      throw new AppError("Memory not found", HTTP_STATUS.NOT_FOUND);
    }

    // Get the event
    const event = await FirestoreService.getDocument(COLLECTIONS.EVENTS, eventId);
    if (!event) {
      throw new AppError("Event not found", HTTP_STATUS.NOT_FOUND);
    }

    // Allow if user is host or memory creator
    if (event.hostId === user.uid || memory.createdBy === user.uid) {
      return next();
    }

    throw new AppError("Not authorized to modify this memory", HTTP_STATUS.FORBIDDEN);
  } catch (error) {
    next(error);
  }
};
