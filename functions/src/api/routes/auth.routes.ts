import {Router} from "express";
import {signUp, login} from "../controllers/auth.controller";
import {validate} from "../../middleware/validation.middleware";
import {authLimiter} from "../../middleware/rateLimit.middleware";
import {signupSchema, loginSchema} from "../validators/auth.validator";

const router = Router();

router.use(authLimiter);

router.post("/signup", validate(signupSchema), signUp);
router.post("/login", validate(loginSchema), login);

export default router;

