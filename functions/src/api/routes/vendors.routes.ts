import {Router} from "express";
import * as vendorsController from "../controllers/vendors.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validate, validateParams, validateQuery} from "../../middleware/validation.middleware";
import {
  vendorFilterQuerySchema,
  vendorIdParamSchema,
  requestQuoteSchema,
  bookVendorSchema,
  reviewVendorSchema,
} from "../validators/vendors.validator";

const router = Router();

router.get("/", validateQuery(vendorFilterQuerySchema), vendorsController.getVendors);
router.get("/:vendorId", validateParams(vendorIdParamSchema), vendorsController.getVendorById);

router.post("/:vendorId/quote", authenticate, validateParams(vendorIdParamSchema), validate(requestQuoteSchema), vendorsController.requestQuote);

router.get("/quotes/user", authenticate, vendorsController.getUserQuotes);

router.post("/:vendorId/book", authenticate, validateParams(vendorIdParamSchema), validate(bookVendorSchema), vendorsController.bookVendor);

router.post("/:vendorId/review", authenticate, validateParams(vendorIdParamSchema), validate(reviewVendorSchema), vendorsController.reviewVendor);

router.get("/categories/list", vendorsController.getVendorCategories);

export default router;
