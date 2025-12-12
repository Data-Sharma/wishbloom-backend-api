import {FirestoreService} from "./database/firestore.service";
import {StorageService} from "./storage/storage.service";
import {COLLECTIONS, HTTP_STATUS} from "../config/constants";
import {logger} from "../utils/logger.util";
import {AppError} from "../utils/error.util";

export class UsersService {
  static async getUserProfile(userId: string) {
    try {
      const user = await FirestoreService.getDocument(COLLECTIONS.USERS, userId);
      if (!user) {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
      }

      if (user.avatarPath) {
        try {
          user.avatarUrl = await StorageService.generateSignedUrl(user.avatarPath);
        } catch (err) {
          logger.warn("Could not generate signed url for avatar", {userId, err});
        }
      }

      return user;
    } catch (error) {
      logger.error("Error fetching user profile", {userId, error});
      throw error;
    }
  }

  static async updateUserProfile(userId: string, data: Partial<Record<string, any>>) {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await FirestoreService.updateDocument(COLLECTIONS.USERS, userId, updateData);
      return await FirestoreService.getDocument(COLLECTIONS.USERS, userId);
    } catch (error) {
      logger.error("Error updating user profile", {userId, error});
      throw error;
    }
  }

  static async updateUserPreferences(userId: string, preferences: any) {
    try {
      const existing = await FirestoreService.getDocument(COLLECTIONS.USERS, userId);

      const mergedPreferences = {
        ...(existing.preferences || {}),
        ...(preferences || {}),
        updatedAt: new Date().toISOString(),
      };

      await FirestoreService.updateDocument(COLLECTIONS.USERS, userId, {
        preferences: mergedPreferences,
      });

      return await FirestoreService.getDocument(COLLECTIONS.USERS, userId);
    } catch (error) {
      logger.error("Error updating user preferences", {userId, error});
      throw error;
    }
  }

  static async updateUserAvatar(
    userId: string,
    fileInfo: {
      buffer: Buffer;
      mimetype: string;
      fileName: string;
      originalName: string;
    }
  ) {
    try {
      await StorageService.uploadBuffer(fileInfo.fileName, fileInfo.buffer, fileInfo.mimetype);

      await FirestoreService.updateDocument(COLLECTIONS.USERS, userId, {
        avatarPath: fileInfo.fileName,
        updatedAt: new Date().toISOString(),
      });

      const user = await FirestoreService.getDocument(COLLECTIONS.USERS, userId);

      if (user.avatarPath) {
        try {
          user.avatarUrl = await StorageService.generateSignedUrl(user.avatarPath);
        } catch (err) {
          logger.warn("Failed to generate signed url after avatar upload", {userId, err});
        }
      }

      return user;
    } catch (error) {
      logger.error("Error updating user avatar", {userId, error});
      throw error;
    }
  }
}
