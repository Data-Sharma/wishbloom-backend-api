import {Request, Response, NextFunction} from "express";
import {AdminService} from "../../services/admin.service";
import {sendSuccess, sendCreated} from "../../utils/response.util";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await AdminService.getAllUsers(req.query);
    sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
};

export const suspendUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await AdminService.suspendUser(req.params.userId, req.body.reason);
    sendCreated(res, null, "User suspended");
  } catch (error) {
    next(error);
  }
};

export const getContentForModeration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const items = await AdminService.getContentForModeration();
    sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
};

export const verifyVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vendor = await AdminService.verifyVendor(req.params.vendorId, req.user?.uid);
    sendSuccess(res, vendor, "Vendor verified");
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await AdminService.getAnalytics();
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};
