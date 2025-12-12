import {Router} from "express";
import {
  register as signUp,
  login,
  loginWithGoogle,
  logout,
  forgotPassword,
  resetPassword,
  resendOtp as sendOtp,
  verifyOtp,
  refreshToken,
  registerWithPhone,
  loginWithPhone,
  sendPhoneOtp,
  verifyPhoneOtp,
} from "../controllers/auth.controller";
import {validate} from "../../middleware/validation.middleware";
import {authLimiter} from "../../middleware/rateLimit.middleware";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  otpSendSchema,
  otpVerifySchema,
  phoneSignupSchema,
  phoneLoginSchema,
} from "../validators/auth.validator";
import {authenticate} from "../../middleware/auth.middleware";

const router = Router();

router.use(authLimiter);

// Email-based auth
router.post("/signup", validate(signupSchema), signUp);
router.post("/login", validate(loginSchema), login);
router.post("/login/google", loginWithGoogle);
router.post("/logout", authenticate, logout);

router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

router.post("/refresh-token", validate(refreshTokenSchema), refreshToken);

// Phone-based auth
router.post("/signup/phone", validate(phoneSignupSchema), registerWithPhone);
router.post("/login/phone", validate(phoneLoginSchema), loginWithPhone);
router.post("/phone/otp/send", validate(otpSendSchema), sendPhoneOtp);
router.post("/phone/otp/verify", validate(otpVerifySchema), verifyPhoneOtp);

// Legacy OTP endpoints (for backward compatibility)
router.post("/otp/send", validate(otpSendSchema), sendOtp);
router.post("/otp/verify", validate(otpVerifySchema), verifyOtp);

export default router;
