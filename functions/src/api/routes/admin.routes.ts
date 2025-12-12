import {Router} from "express";
import * as adminController from "../controllers/admin.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {adminOnly} from "../../middleware/adminAuth.middleware";
import {validateParams} from "../../middleware/validation.middleware";
import {userIdParamSchema, vendorIdParamsSchema} from "../validators/common.validator";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, adminOnly);

// Users
router.get("/users", adminController.getAllUsers);
router.post("/users/:userId/suspend", validateParams(userIdParamSchema), adminController.suspendUser);

// Content moderation
router.get("/content/moderate", adminController.getContentForModeration);

// Vendors
router.post("/vendors/:vendorId/verify", validateParams(vendorIdParamsSchema), adminController.verifyVendor);

// Analytics
router.get("/analytics", adminController.getAnalytics);

export default router;
