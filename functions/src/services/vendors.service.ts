import {FirestoreService} from "./database/firestore.service";
import {COLLECTIONS} from "../config/constants";
import {logger} from "../utils/logger.util";
import {createNotFoundError} from "../utils/error.util";
import type {WhereFilterOp} from "firebase-admin/firestore";

export interface VendorData {
  name: string;
  category: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  notes?: string;
  rating?: number;
}

export class VendorsService {
  static async createVendor(data: VendorData, createdBy?: string): Promise<any> {
    const vendor = await FirestoreService.createDocument(COLLECTIONS.VENDORS, {
      ...data,
      createdBy,
    });

    logger.info("Vendor created", {vendorId: vendor.id});
    return vendor;
  }

  static async getVendors(query: Record<string, any>): Promise<any[]> {
    const filters: { field: string; operator: WhereFilterOp; value: any }[] = [];
    if (query.category) {
      filters.push({field: "category", operator: "==" as const, value: query.category});
    }

    const vendors = await FirestoreService.getDocuments(COLLECTIONS.VENDORS, filters);

    if (query.search) {
      const search = String(query.search).toLowerCase();
      return vendors.filter(
        (vendor) =>
          vendor.name?.toLowerCase().includes(search) ||
          vendor.category?.toLowerCase().includes(search)
      );
    }

    return vendors;
  }

  static async getVendor(vendorId: string): Promise<any> {
    try {
      return await FirestoreService.getDocument(COLLECTIONS.VENDORS, vendorId);
    } catch (error) {
      throw createNotFoundError("Vendor");
    }
  }

  static async updateVendor(vendorId: string, data: Partial<VendorData>): Promise<void> {
    await FirestoreService.updateDocument(COLLECTIONS.VENDORS, vendorId, data);
  }

  static async deleteVendor(vendorId: string): Promise<void> {
    await FirestoreService.deleteDocument(COLLECTIONS.VENDORS, vendorId);
  }
}
