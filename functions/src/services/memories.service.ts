import {FirestoreService} from "./database/firestore.service";
import {COLLECTIONS} from "../config/constants";
import {logger} from "../utils/logger.util";
import {createNotFoundError} from "../utils/error.util";

export interface MemoryInput {
  title: string;
  description?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "note";
  tags?: string[];
  visibility?: "private" | "guests" | "public";
  createdBy?: string;
}

export class MemoriesService {
  static async listMemories(eventId: string): Promise<any[]> {
    return FirestoreService.getSubcollection(COLLECTIONS.EVENTS, eventId, COLLECTIONS.MEMORIES);
  }

  static async getMemory(eventId: string, memoryId: string): Promise<any> {
    const memory = await FirestoreService.getSubcollectionDocument(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.MEMORIES,
      memoryId
    );

    if (!memory) {
      throw createNotFoundError("Memory");
    }

    return memory;
  }

  static async createMemory(eventId: string, data: MemoryInput): Promise<any> {
    const memory = await FirestoreService.createSubcollectionDocument(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.MEMORIES,
      {
        ...data,
        visibility: data.visibility || "guests",
        createdBy: data.createdBy,
      }
    );

    logger.info("Memory created", {eventId, memoryId: memory.id});
    return memory;
  }

  static async updateMemory(
    eventId: string,
    memoryId: string,
    data: Partial<MemoryInput>
  ): Promise<any> {
    await FirestoreService.updateSubcollectionDocument(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.MEMORIES,
      memoryId,
      data
    );

    logger.info("Memory updated", {eventId, memoryId});
    return this.getMemory(eventId, memoryId);
  }

  static async deleteMemory(eventId: string, memoryId: string): Promise<void> {
    await FirestoreService.deleteSubcollectionDocument(
      COLLECTIONS.EVENTS,
      eventId,
      COLLECTIONS.MEMORIES,
      memoryId
    );

    logger.info("Memory deleted", {eventId, memoryId});
  }
}

