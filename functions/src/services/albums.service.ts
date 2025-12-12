import {FirestoreService} from "./database/firestore.service";
import {COLLECTIONS} from "../config/constants";
import {logger} from "../utils/logger.util";

export class AlbumsService {
  static async createAlbum(eventId: string, data: any) {
    const created = await FirestoreService.createSubcollectionDocument(COLLECTIONS.EVENTS, eventId, "albums", {
      title: data.title || null,
      description: data.description || null,
      memoryIds: data.memoryIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return created;
  }

  static async listAlbums(eventId: string) {
    return FirestoreService.getSubcollection(COLLECTIONS.EVENTS, eventId, "albums");
  }

  static async getAlbum(eventId: string, albumId: string) {
    return FirestoreService.getSubcollectionDocument(COLLECTIONS.EVENTS, eventId, "albums", albumId);
  }

  static async updateAlbum(eventId: string, albumId: string, data: any) {
    await FirestoreService.updateSubcollectionDocument(COLLECTIONS.EVENTS, eventId, "albums", albumId, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  static async deleteAlbum(eventId: string, albumId: string) {
    await FirestoreService.deleteSubcollectionDocument(COLLECTIONS.EVENTS, eventId, "albums", albumId);
    logger.info("Album deleted", {eventId, albumId});
  }
}
