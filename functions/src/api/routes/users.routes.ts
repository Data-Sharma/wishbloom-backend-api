import {Router} from "express";
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getUserPreferences,
  updateUserPreferences,
} from "../controllers/users.controller";
import {updatePreferencesSchema} from "../validators/userPreferences.validator";
import {uploadAvatar as uploadAvatarMw, processAvatar} from "../../middlewares/uploadAvatar.middleware";
import {authenticate} from "../../middleware/auth.middleware";
import {validate} from "../../middleware/validation.middleware";
import {userIdParamSchema, updateUserProfileSchema} from "../validators/users.validator";

const router = Router();

router.use(authenticate);

// Get user profile
router.get("/:userId", validate(userIdParamSchema), getUserProfile);

// Update user profile
router.put("/:userId", validate(updateUserProfileSchema), updateUserProfile);

// Upload user avatar
router.post(
  "/:userId/avatar",
  validate(userIdParamSchema),
  uploadAvatarMw,
  processAvatar,
  uploadAvatar
);

// Get user preferences
router.get("/:userId/preferences", validate(userIdParamSchema), getUserPreferences);

// Update user preferences
router.put("/:userId/preferences", validate(updatePreferencesSchema), updateUserPreferences);

export default router;
