import {Request, Response, NextFunction} from "express";
import {VendorsService} from "../../services/vendors.service";
import {sendCreated, sendNoContent, sendSuccess} from "../../utils/response.util";

export const createVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vendor = await VendorsService.createVendor(req.body, req.user?.uid);
    sendCreated(res, vendor, "Vendor profile created");
  } catch (error) {
    next(error);
  }
};

export const getVendors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vendors = await VendorsService.getVendors(req.query);
    sendSuccess(res, vendors);
  } catch (error) {
    next(error);
  }
};

export const getVendorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vendor = await VendorsService.getVendor(req.params.vendorId);
    sendSuccess(res, vendor);
  } catch (error) {
    next(error);
  }
};

export const updateVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await VendorsService.updateVendor(req.params.vendorId, req.body);
    const vendor = await VendorsService.getVendor(req.params.vendorId);
    sendSuccess(res, vendor, "Vendor updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await VendorsService.deleteVendor(req.params.vendorId);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};
