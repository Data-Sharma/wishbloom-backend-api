import {Router} from "express";
import * as vendorsController from "../controllers/vendors.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validate, validateParams, validateQuery} from "../../middleware/validation.middleware";
import {createVendorSchema, updateVendorSchema} from "../validators/vendors.validator";
import {paginationQuerySchema, vendorIdParamsSchema} from "../validators/common.validator";

const router = Router();

router.post("/", authenticate, validate(createVendorSchema), vendorsController.createVendor);

router.get("/", authenticate, validateQuery(paginationQuerySchema), vendorsController.getVendors);

router.get("/:vendorId", authenticate, validateParams(vendorIdParamsSchema), vendorsController.getVendorById);

router.put(
  "/:vendorId",
  authenticate,
  validateParams(vendorIdParamsSchema),
  validate(updateVendorSchema),
  vendorsController.updateVendor
);

router.delete(
  "/:vendorId",
  authenticate,
  validateParams(vendorIdParamsSchema),
  vendorsController.deleteVendor
);

export default router;
