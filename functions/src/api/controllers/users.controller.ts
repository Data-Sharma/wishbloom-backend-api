import {Request, Response, NextFunction} from "express";
import {UsersService} from "../../services/users.service";
import {sendSuccess} from "../../utils/response.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {userId} = req.params;

    if (req.user?.uid !== userId) {
      throw new AppError("Unauthorized access to user profile", HTTP_STATUS.FORBIDDEN);
    }

    const user = await UsersService.getUserProfile(userId);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {userId} = req.params;

    if (req.user?.uid !== userId) {
      throw new AppError("Unauthorized to update this profile", HTTP_STATUS.FORBIDDEN);
    }

    const updatedUser = await UsersService.updateUserProfile(userId, req.body);
    sendSuccess(res, updatedUser, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {userId} = req.params;

    if (req.user?.uid !== userId) {
      throw new AppError("Unauthorized to update this profile", HTTP_STATUS.FORBIDDEN);
    }

    if (!req.fileInfo) {
      throw new AppError("No file uploaded", HTTP_STATUS.BAD_REQUEST);
    }

    const updatedUser = await UsersService.updateUserAvatar(userId, req.fileInfo);
    sendSuccess(res, updatedUser, "Avatar uploaded successfully");
  } catch (error) {
    next(error);
  }
};

export const getUserPreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {userId} = req.params;

    if (req.user?.uid !== userId) {
      throw new AppError("Unauthorized to access these preferences", HTTP_STATUS.FORBIDDEN);
    }

    const user = await UsersService.getUserProfile(userId);
    sendSuccess(res, {preferences: user.preferences || {}});
  } catch (error) {
    next(error);
  }
};

export const updateUserPreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {userId} = req.params;

    if (req.user?.uid !== userId) {
      throw new AppError("Unauthorized to update these preferences", HTTP_STATUS.FORBIDDEN);
    }

    const updatedUser = await UsersService.updateUserPreferences(userId, req.body.preferences || {});
    sendSuccess(res, {preferences: updatedUser.preferences || {}}, "Preferences updated successfully");
  } catch (error) {
    next(error);
  }
};
