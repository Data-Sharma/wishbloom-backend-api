import {Request, Response, NextFunction} from "express";
import {VendorsService} from "../../services/vendors.service";
import {sendSuccess, sendCreated} from "../../utils/response.util";

export const getVendors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendors = await VendorsService.getVendors(req.query);
    sendSuccess(res, vendors);
  } catch (err) {
    next(err);
  }
};

export const getVendorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await VendorsService.getVendorById(req.params.vendorId);
    sendSuccess(res, vendor);
  } catch (err) {
    next(err);
  }
};

export const requestQuote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quote = await VendorsService.requestQuote(req.params.vendorId, req.user?.uid!, req.body);
    sendCreated(res, quote);
  } catch (err) {
    next(err);
  }
};

export const getUserQuotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quotes = await VendorsService.getQuotesForUser(req.user?.uid!);
    sendSuccess(res, quotes);
  } catch (err) {
    next(err);
  }
};

export const bookVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await VendorsService.bookVendor(req.params.vendorId, req.user?.uid!, req.body);
    sendCreated(res, booking);
  } catch (err) {
    next(err);
  }
};

export const reviewVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await VendorsService.reviewVendor(req.params.vendorId, req.user?.uid!, req.body);
    sendCreated(res, review);
  } catch (err) {
    next(err);
  }
};

export const getVendorCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = VendorsService.getVendorCategories();
    sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
};
