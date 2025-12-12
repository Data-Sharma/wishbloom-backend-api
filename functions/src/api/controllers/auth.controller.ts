// functions/src/api/controllers/auth.controller.ts
import {Request, Response, NextFunction} from "express";
import {auth, db} from "../../config/firebase.config";
import {COLLECTIONS, HTTP_STATUS, USER_ROLES} from "../../config/constants";
import {config} from "../../config/env.config";
import {AppError} from "../../utils/error.util";
import {sendCreated, sendSuccess} from "../../utils/response.util";
import {logger} from "../../utils/logger.util";
import {EmailService} from "../../services/notification/email.service";

interface IdentityToolkitResponse {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  email: string;
  registered?: boolean;
  error?: { message?: string };
}

interface AuthTokens {
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

const getIdentityToolkitUrl = (): string => {
  const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;

  const apiKey =
    config.firebaseWebApiKey ||
    config.identityToolkitApiKey ||
    process.env.FIREBASE_WEB_API_KEY ||
    process.env.IDENTITY_TOOLKIT_API_KEY;

  if (!apiKey) {
    logger.error("Identity Toolkit API key missing");
    throw new AppError("Authentication service not configured", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  if (emulatorHost) {
    // emulator path for signInWithPassword
    return `http://${emulatorHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
  }

  return `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
};

const getResetPasswordUrl = (): string => {
  const apiKey = config.identityToolkitApiKey || config.firebaseWebApiKey || process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) {
    throw new AppError("Authentication service not configured", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
  const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  if (emulatorHost) {
    return `http://${emulatorHost}/identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`;
  }
  return `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`;
};

const signInWithEmailAndPassword = async (email: string, password: string): Promise<AuthTokens & { localId: string }> => {
  try {
    const url = getIdentityToolkitUrl();
    const resp = await fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email, password, returnSecureToken: true}),
    });

    const payload = (await resp.json()) as IdentityToolkitResponse & { error?: { message?: string } };

    if (!resp.ok) {
      const code = payload?.error?.message;
      logger.warn("Identity Toolkit login failed", {email, code});
      if (code === "INVALID_PASSWORD") throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
      if (code === "EMAIL_NOT_FOUND") throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
      throw new AppError("Unable to login user", HTTP_STATUS.BAD_REQUEST);
    }

    return {
      idToken: payload.idToken,
      refreshToken: payload.refreshToken,
      expiresIn: Number(payload.expiresIn),
      localId: payload.localId,
    };
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    logger.error("Unexpected Identity Toolkit error", err);
    throw new AppError("Unable to login user", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const exchangeRefreshToken = async (refreshToken: string) => {
  const apiKey = config.identityToolkitApiKey || config.firebaseWebApiKey || process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) throw new AppError("Auth key not configured", HTTP_STATUS.INTERNAL_SERVER_ERROR);

  const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const resp = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: body.toString(),
  });

  const payload = await resp.json();
  if (!resp.ok) {
    logger.warn("Refresh token exchange failed", {payload});
    throw new AppError("Invalid refresh token", HTTP_STATUS.UNAUTHORIZED);
  }

  return {
    idToken: payload.id_token as string,
    expiresIn: Number(payload.expires_in),
    userId: payload.user_id as string,
  };
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {email, password, displayName, role} = req.body as { email: string; password: string; displayName?: string; role?: string };

    if (!email || !password) {
      throw new AppError("Email and password are required", HTTP_STATUS.BAD_REQUEST);
    }

    const normalizedRole = role || USER_ROLES.HOST;

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || undefined,
      emailVerified: false,
      disabled: false,
    });

    await auth.setCustomUserClaims(userRecord.uid, {role: normalizedRole});

    await db.collection(COLLECTIONS.USERS).doc(userRecord.uid).set(
      {
        email,
        displayName: displayName || null,
        role: normalizedRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {merge: true}
    );

    sendCreated(res, {user: {uid: userRecord.uid, email: userRecord.email, displayName: userRecord.displayName, role: normalizedRole}}, "Account created successfully");
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Optionally: implement server-side token blacklist (not implemented here)
    sendSuccess(res, {message: "Logged out (client should clear tokens)"});
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {email} = req.body as { email: string };
    if (!email) throw new AppError("Email is required", HTTP_STATUS.BAD_REQUEST);

    // Generate password reset link
    const resetLink = await auth.generatePasswordResetLink(email);
    
    try {
      // Send email using EmailService (uses your templates)
      await EmailService.sendEmail({to: email, subject: "Password reset", html: `<p>Click to reset your password: <a href="${resetLink}">${resetLink}</a></p>`});
    } catch (emailError) {
      logger.warn("Failed to send password reset email", {email, error: emailError});
      // Continue with response even if email fails
    }

    sendSuccess(res, {message: "Password reset email sent"});
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {oobCode, newPassword} = req.body as { oobCode: string; newPassword: string };
    if (!oobCode || !newPassword) throw new AppError("oobCode and newPassword are required", HTTP_STATUS.BAD_REQUEST);

    const url = getResetPasswordUrl();
    const resp = await fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({oobCode, newPassword}),
    });

    const payload = await resp.json();
    if (!resp.ok) {
      logger.warn("Password reset failed", {payload});
      throw new AppError("Invalid or expired reset code", HTTP_STATUS.BAD_REQUEST);
    }

    sendSuccess(res, {message: "Password has been reset"});
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Not authenticated", HTTP_STATUS.UNAUTHORIZED);

    // Ensure the decoded token contains phone number and it's verified
    const phone = (req.user as any).phoneNumber;
    const phoneVerified = (req.user as any).phoneNumberVerified;

    if (!phone || !phoneVerified) {
      throw new AppError("Phone number not verified", HTTP_STATUS.FORBIDDEN);
    }

    // Update Firestore user record to mark phone verified
    await db.collection(COLLECTIONS.USERS).doc(req.user.uid).set(
      {phoneNumber: phone, phoneVerified: true, updatedAt: new Date().toISOString()},
      {merge: true}
    );

    sendSuccess(res, {message: "Phone verified"});
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, {message: "Resend OTP must be performed on client using Firebase Phone Auth SDK"});
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {refreshToken: rt} = req.body as { refreshToken?: string };
    if (!rt) throw new AppError("refreshToken is required", HTTP_STATUS.BAD_REQUEST);

    const result = await exchangeRefreshToken(rt);
    sendSuccess(res, {idToken: result.idToken, expiresIn: result.expiresIn, userId: result.userId});
  } catch (error) {
    next(error);
  }
};

export const registerWithPhone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {phone, password, displayName, role, email} = req.body as { 
      phone: string; 
      password: string; 
      displayName?: string; 
      role?: string;
      email?: string;
    };

    if (!phone || !password) {
      throw new AppError("Phone and password are required", HTTP_STATUS.BAD_REQUEST);
    }

    const normalizedRole = role || USER_ROLES.HOST;

    // Create user with phone number as primary identifier
    const userRecord = await auth.createUser({
      phoneNumber: phone,
      password,
      displayName: displayName || undefined,
      emailVerified: false,
      disabled: false,
      ...(email && { email }) // Add email if provided
    });

    await auth.setCustomUserClaims(userRecord.uid, {role: normalizedRole});

    // Store user in Firestore
    const userData: any = {
      phone,
      phoneVerified: false, // Will be verified via OTP
      role: normalizedRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (displayName) userData.displayName = displayName;
    if (email) userData.email = email;

    await db.collection(COLLECTIONS.USERS).doc(userRecord.uid).set(userData, {merge: true});

    sendCreated(res, {
      user: {
        uid: userRecord.uid, 
        phone: userRecord.phoneNumber, 
        displayName: userRecord.displayName, 
        role: normalizedRole,
        ...(email && { email })
      }
    }, "Account created successfully. Please verify your phone number.");
  } catch (error) {
    next(error);
  }
};

export const loginWithPhone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {phone, otp} = req.body as { phone: string; otp: string };
    
    if (!phone || !otp) {
      throw new AppError("Phone and OTP are required", HTTP_STATUS.BAD_REQUEST);
    }

    // Find user by phone number
    const usersSnapshot = await db.collection(COLLECTIONS.USERS)
      .where('phone', '==', phone)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    // Get Firebase Auth user
    const userRecord = await auth.getUser(userId);

    // Verify OTP using Firebase Admin SDK (you'd need to implement OTP verification logic)
    // For now, we'll simulate OTP verification
    // In production, you'd use Firebase's phone auth verification or a custom OTP service
    
    // Create custom token for the user
    const customToken = await auth.createCustomToken(userId, {role: userData.role});

    sendSuccess(res, {
      user: {
        uid: userId,
        phone: userRecord.phoneNumber,
        displayName: userRecord.displayName,
        role: userData.role,
        phoneVerified: userData.phoneVerified || false
      },
      tokens: {customToken},
    }, "Login successful");
  } catch (error) {
    next(error);
  }
};

export const sendPhoneOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {phone} = req.body as { phone: string };
    
    if (!phone) {
      throw new AppError("Phone number is required", HTTP_STATUS.BAD_REQUEST);
    }

    // Generate and send OTP using Twilio or Firebase Phone Auth
    // For now, we'll simulate OTP sending
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP temporarily (in production, use Redis with expiry)
    await db.collection('temp_otps').doc(phone).set({
      otp,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    });

    // Send OTP via SMS (using Twilio)
    // await SMSService.sendOTP(phone, otp);

    sendSuccess(res, {message: "OTP sent successfully", expiresIn: "10 minutes"});
  } catch (error) {
    next(error);
  }
};

export const verifyPhoneOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {phone, code} = req.body as { phone: string; code: string };
    
    if (!phone || !code) {
      throw new AppError("Phone and verification code are required", HTTP_STATUS.BAD_REQUEST);
    }

    // Verify OTP from temporary storage
    const otpDoc = await db.collection('temp_otps').doc(phone).get();
    
    if (!otpDoc.exists) {
      throw new AppError("OTP not found or expired", HTTP_STATUS.BAD_REQUEST);
    }

    const otpData = otpDoc.data();
    
    if (otpData?.otp !== code) {
      throw new AppError("Invalid OTP", HTTP_STATUS.BAD_REQUEST);
    }

    if (new Date() > new Date(otpData.expiresAt)) {
      throw new AppError("OTP expired", HTTP_STATUS.BAD_REQUEST);
    }

    // Mark phone as verified in user profile
    const usersSnapshot = await db.collection(COLLECTIONS.USERS)
      .where('phone', '==', phone)
      .limit(1)
      .get();

    if (!usersSnapshot.empty) {
      const userId = usersSnapshot.docs[0].id;
      await db.collection(COLLECTIONS.USERS).doc(userId).update({
        phoneVerified: true,
        updatedAt: new Date().toISOString(),
      });
    }

    // Clean up OTP
    await db.collection('temp_otps').doc(phone).delete();

    sendSuccess(res, {message: "Phone number verified successfully"});
  } catch (error) {
    next(error);
  }
};

export const loginWithGoogle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {idToken} = req.body as { idToken: string };
    if (!idToken) {
      throw new AppError("Google ID token is required", HTTP_STATUS.BAD_REQUEST);
    }

    // Verify the Google ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const {uid, email, name, picture} = decodedToken;

    if (!email) {
      throw new AppError("Email is required from Google account", HTTP_STATUS.BAD_REQUEST);
    }

    // Check if user exists in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUser(uid);
    } catch (err: any) {
      if (err?.code === "auth/user-not-found") {
        // User doesn't exist, create them
        userRecord = await auth.createUser({
          uid,
          email,
          displayName: name || undefined,
          photoURL: picture || undefined,
          emailVerified: true,
          disabled: false,
        });
      } else {
        throw err;
      }
    }

    // Set custom claims if not already set
    const claims = (userRecord.customClaims || {}) as { role?: string };
    const role = claims.role || USER_ROLES.HOST;
    
    if (!claims.role) {
      await auth.setCustomUserClaims(uid, {role});
    }

    // Update Firestore user record
    await db.collection(COLLECTIONS.USERS).doc(uid).set(
      {
        email,
        displayName: name || null,
        photoURL: picture || null,
        role,
        emailVerified: true,
        authProvider: "google",
        updatedAt: new Date().toISOString(),
      },
      {merge: true}
    );

    sendSuccess(res, {
      user: {
        uid,
        email,
        displayName: name || userRecord.displayName,
        photoURL: picture || userRecord.photoURL,
        role,
        emailVerified: true,
      },
      tokens: {idToken},
    }, "Google login successful");
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {email, password} = req.body as { email: string; password: string };
    if (!email || !password) {
      throw new AppError("Email and password are required", HTTP_STATUS.BAD_REQUEST);
    }

    // Ensure user exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (err: any) {
      if (err?.code === "auth/user-not-found") throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
      throw err;
    }

    const tokens = await signInWithEmailAndPassword(email, password);
    const claims = (userRecord.customClaims || {}) as { role?: string };
    const role = claims.role || USER_ROLES.HOST;

    sendSuccess(res, {
      user: {uid: userRecord.uid, email: userRecord.email, displayName: userRecord.displayName, role},
      tokens: {idToken: tokens.idToken, refreshToken: tokens.refreshToken, expiresIn: tokens.expiresIn},
    }, "Login successful");
  } catch (error) {
    next(error);
  }
};

export const signUp = register;
