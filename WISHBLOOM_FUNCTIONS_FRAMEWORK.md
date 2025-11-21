# WishBloom - Firebase Functions API Framework

## 📋 Table of Contents
1. [Project Setup](#1-project-setup)
2. [Project Structure](#2-project-structure)
3. [Core Configuration](#3-core-configuration)
4. [Authentication Middleware](#4-authentication-middleware)
5. [API Endpoints](#5-api-endpoints)
6. [Database Operations](#6-database-operations)
7. [AI Integration](#7-ai-integration)
8. [Payment Processing](#8-payment-processing)
9. [Notification System](#9-notification-system)
10. [Storage Management](#10-storage-management)
11. [Scheduled Tasks](#11-scheduled-tasks)
12. [Error Handling](#12-error-handling)
13. [Testing](#13-testing)
14. [Deployment](#14-deployment)

---

## 1. Project Setup

### Step 1.1: Initialize Firebase Functions

```bash
# Navigate to your project root
cd wishbloom

# Initialize Firebase Functions
firebase init functions

# Select options:
# - Use existing project
# - TypeScript
# - ESLint
# - Install dependencies
```

### Step 1.2: Install Dependencies

```bash
cd functions

# Core dependencies
npm install express cors
npm install firebase-admin
npm install firebase-functions@latest

# Utilities
npm install lodash
npm install uuid
npm install date-fns
npm install joi  # Request validation
npm install helmet  # Security headers
npm install express-rate-limit  # Rate limiting
npm install compression  # Response compression

# AI & LLM
npm install @google/generative-ai
npm install @langchain/core @langchain/google-vertexai
npm install openai  # If using OpenAI

# Payment
npm install stripe

# Email
npm install nodemailer
npm install @sendgrid/mail
npm install handlebars  # Email templates

# Image Processing
npm install sharp

# PDF Generation
npm install pdfkit

# Testing
npm install --save-dev @types/express
npm install --save-dev @types/node
npm install --save-dev @types/lodash
npm install --save-dev @types/cors
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev supertest @types/supertest
npm install --save-dev eslint-config-google
```

### Step 1.3: Update Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint --ext .js,.ts .",
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 2. Project Structure

```
functions/
├── src/
│   ├── index.ts                    # Main entry point
│   ├── config/
│   │   ├── firebase.config.ts      # Firebase initialization
│   │   ├── env.config.ts           # Environment variables
│   │   ├── constants.ts            # Application constants
│   │   └── cors.config.ts          # CORS configuration
│   ├── middleware/
│   │   ├── auth.middleware.ts      # Authentication
│   │   ├── validation.middleware.ts # Request validation
│   │   ├── error.middleware.ts     # Error handling
│   │   ├── rateLimit.middleware.ts # Rate limiting
│   │   └── logger.middleware.ts    # Request logging
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── events.routes.ts
│   │   │   ├── guests.routes.ts
│   │   │   ├── gifts.routes.ts
│   │   │   ├── vendors.routes.ts
│   │   │   ├── invitations.routes.ts
│   │   │   ├── memories.routes.ts
│   │   │   ├── ai.routes.ts
│   │   │   └── payments.routes.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── events.controller.ts
│   │   │   ├── guests.controller.ts
│   │   │   ├── gifts.controller.ts
│   │   │   ├── vendors.controller.ts
│   │   │   ├── invitations.controller.ts
│   │   │   ├── memories.controller.ts
│   │   │   ├── ai.controller.ts
│   │   │   └── payments.controller.ts
│   │   └── validators/
│   │       ├── auth.validator.ts
│   │       ├── events.validator.ts
│   │       ├── guests.validator.ts
│   │       ├── gifts.validator.ts
│   │       └── common.validator.ts
│   ├── services/
│   │   ├── events.service.ts
│   │   ├── guests.service.ts
│   │   ├── gifts.service.ts
│   │   ├── vendors.service.ts
│   │   ├── invitations.service.ts
│   │   ├── memories.service.ts
│   │   ├── ai/
│   │   │   ├── gemini.service.ts
│   │   │   ├── theme-generator.service.ts
│   │   │   └── content-generator.service.ts
│   │   ├── payment/
│   │   │   └── stripe.service.ts
│   │   ├── notification/
│   │   │   ├── email.service.ts
│   │   │   ├── sms.service.ts
│   │   │   └── push.service.ts
│   │   ├── storage/
│   │   │   └── storage.service.ts
│   │   └── database/
│   │       └── firestore.service.ts
│   ├── utils/
│   │   ├── logger.util.ts
│   │   ├── response.util.ts
│   │   ├── error.util.ts
│   │   ├── date.util.ts
│   │   ├── validation.util.ts
│   │   └── crypto.util.ts
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── event.types.ts
│   │   ├── guest.types.ts
│   │   ├── gift.types.ts
│   │   └── vendor.types.ts
│   ├── triggers/
│   │   ├── auth.triggers.ts        # Auth event handlers
│   │   ├── firestore.triggers.ts   # Firestore triggers
│   │   └── storage.triggers.ts     # Storage triggers
│   ├── scheduled/
│   │   ├── reminders.scheduled.ts  # Event reminders
│   │   ├── cleanup.scheduled.ts    # Data cleanup
│   │   └── analytics.scheduled.ts  # Analytics processing
│   └── templates/
│       └── email/
│           ├── invitation.hbs
│           ├── rsvp-confirmation.hbs
│           ├── event-reminder.hbs
│           └── gift-confirmation.hbs
├── tests/
│   ├── unit/
│   ├── integration/
│   └── setup.ts
├── .env.local
├── .eslintrc.js
├── tsconfig.json
├── jest.config.js
└── package.json
```

---

## 3. Core Configuration

### Step 3.1: Environment Configuration

**Create `src/config/env.config.ts`:**

```typescript
import * as functions from 'firebase-functions';

interface Config {
  firebase: {
    projectId: string;
    storageBucket: string;
  };
  ai: {
    geminiApiKey: string;
    vertexProject: string;
    vertexLocation: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  sendgrid: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  twilio?: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  app: {
    environment: 'development' | 'staging' | 'production';
    frontendUrl: string;
    apiVersion: string;
  };
  features: {
    enableAI: boolean;
    enablePayments: boolean;
    enableNotifications: boolean;
  };
}

const config: Config = {
  firebase: {
    projectId: process.env.GCLOUD_PROJECT || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  },
  ai: {
    geminiApiKey: functions.config().gemini?.api_key || process.env.GEMINI_API_KEY || '',
    vertexProject: process.env.VERTEX_PROJECT_ID || '',
    vertexLocation: process.env.VERTEX_LOCATION || 'us-central1',
  },
  stripe: {
    secretKey: functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  sendgrid: {
    apiKey: functions.config().sendgrid?.api_key || process.env.SENDGRID_API_KEY || '',
    fromEmail: functions.config().sendgrid?.from_email || process.env.SENDGRID_FROM_EMAIL || 'noreply@wishbloom.com',
    fromName: 'WishBloom',
  },
  twilio: {
    accountSid: functions.config().twilio?.account_sid || process.env.TWILIO_ACCOUNT_SID || '',
    authToken: functions.config().twilio?.auth_token || process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: functions.config().twilio?.phone_number || process.env.TWILIO_PHONE_NUMBER || '',
  },
  app: {
    environment: (process.env.NODE_ENV as any) || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    apiVersion: 'v1',
  },
  features: {
    enableAI: process.env.ENABLE_AI === 'true',
    enablePayments: process.env.ENABLE_PAYMENTS === 'true',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true',
  },
};

export default config;

// Validate required config on startup
export function validateConfig(): void {
  const required = [
    { key: 'firebase.projectId', value: config.firebase.projectId },
    { key: 'app.frontendUrl', value: config.app.frontendUrl },
  ];

  const missing = required.filter(({ value }) => !value);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required configuration: ${missing.map(({ key }) => key).join(', ')}`
    );
  }
}
```

### Step 3.2: Firebase Admin Configuration

**Create `src/config/firebase.config.ts`:**

```typescript
import * as admin from 'firebase-admin';
import config from './env.config';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: config.firebase.storageBucket,
  });
}

// Export initialized services
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export const messaging = admin.messaging();

// Configure Firestore settings
db.settings({
  ignoreUndefinedProperties: true,
});

export default admin;
```

### Step 3.3: Constants Configuration

**Create `src/config/constants.ts`:**

```typescript
export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  GUESTS: 'guests',
  GIFTS: 'gifts',
  VENDORS: 'vendors',
  INVITATIONS: 'invitations',
  MEMORIES: 'memories',
  NOTIFICATIONS: 'notifications',
  PAYMENTS: 'payments',
} as const;

export const EVENT_TYPES = {
  WEDDING: 'wedding',
  BIRTHDAY: 'birthday',
  CORPORATE: 'corporate',
  ANNIVERSARY: 'anniversary',
  BABY_SHOWER: 'baby_shower',
  GRADUATION: 'graduation',
  OTHER: 'other',
} as const;

export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const RSVP_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  MAYBE: 'maybe',
} as const;

export const GIFT_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  PURCHASED: 'purchased',
  DELIVERED: 'delivered',
} as const;

export const USER_ROLES = {
  HOST: 'host',
  GUEST: 'guest',
  VENDOR: 'vendor',
  ADMIN: 'admin',
} as const;

export const NOTIFICATION_TYPES = {
  EVENT_INVITATION: 'event_invitation',
  RSVP_UPDATE: 'rsvp_update',
  GIFT_PURCHASE: 'gift_purchase',
  EVENT_REMINDER: 'event_reminder',
  VENDOR_MESSAGE: 'vendor_message',
  MEMORY_UPLOAD: 'memory_upload',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests
  },
  API: {
    windowMs: 15 * 60 * 1000,
    max: 100, // 100 requests
  },
  AI: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 requests
  },
} as const;

export const FILE_LIMITS = {
  IMAGE: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  VIDEO: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  },
  DOCUMENT: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
} as const;
```

### Step 3.4: CORS Configuration

**Create `src/config/cors.config.ts`:**

```typescript
import { CorsOptions } from 'cors';
import config from './env.config';

const allowedOrigins = [
  config.app.frontendUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  // Add production domains
  'https://wishbloom.com',
  'https://www.wishbloom.com',
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || config.app.environment === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
```

---

## 4. Authentication Middleware

### Step 4.1: Auth Middleware

**Create `src/middleware/auth.middleware.ts`:**

```typescript
import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase.config';
import { AppError } from '../utils/error.util';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';
import logger from '../utils/logger.util';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string | undefined;
    role: string;
    emailVerified: boolean;
  };
}

/**
 * Verify Firebase ID token and attach user to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'No authentication token provided',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      throw new AppError(
        'Invalid token format',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    // Verify token
    const decodedToken = await auth.verifyIdToken(token);

    // Get user custom claims for role
    const userRecord = await auth.getUser(decodedToken.uid);
    const customClaims = userRecord.customClaims || {};

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: customClaims.role || 'host',
      emailVerified: decodedToken.email_verified || false,
    };

    next();
  } catch (error: any) {
    logger.error('Authentication error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      next(new AppError('Token expired', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED));
    } else if (error.code === 'auth/argument-error') {
      next(new AppError('Invalid token', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED));
    } else if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Authentication failed', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED));
    }
  }
};

/**
 * Check if user has required role
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED)
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          'Insufficient permissions',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN
        )
      );
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      const userRecord = await auth.getUser(decodedToken.uid);
      const customClaims = userRecord.customClaims || {};

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: customClaims.role || 'host',
        emailVerified: decodedToken.email_verified || false,
      };
    }

    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

/**
 * Verify email is verified
 */
export const requireEmailVerification = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(
      new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED)
    );
  }

  if (!req.user.emailVerified) {
    return next(
      new AppError(
        'Email verification required',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      )
    );
  }

  next();
};
```

### Step 4.2: Validation Middleware

**Create `src/middleware/validation.middleware.ts`:**

```typescript
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/error.util';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return next(
        new AppError(
          'Validation error',
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          ERROR_CODES.VALIDATION_ERROR,
          errors
        )
      );
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return next(
        new AppError(
          'Query validation error',
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          ERROR_CODES.VALIDATION_ERROR,
          errors
        )
      );
    }

    req.query = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return next(
        new AppError(
          'Parameter validation error',
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          ERROR_CODES.VALIDATION_ERROR,
          errors
        )
      );
    }

    req.params = value;
    next();
  };
};
```

### Step 4.3: Rate Limiting Middleware

**Create `src/middleware/rateLimit.middleware.ts`:**

```typescript
import rateLimit from 'express-rate-limit';
import { RATE_LIMITS, HTTP_STATUS } from '../config/constants';

export const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: RATE_LIMITS.AUTH.max,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});

export const apiLimiter = rateLimit({
  windowMs: RATE_LIMITS.API.windowMs,
  max: RATE_LIMITS.API.max,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});

export const aiLimiter = rateLimit({
  windowMs: RATE_LIMITS.AI.windowMs,
  max: RATE_LIMITS.AI.max,
  message: 'AI request limit exceeded, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});

export const createCustomLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Rate limit exceeded',
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  });
};
```

### Step 4.4: Error Handling Middleware

**Create `src/middleware/error.middleware.ts`:**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.util';
import { HTTP_STATUS } from '../config/constants';
import logger from '../utils/logger.util';
import config from '../config/env.config';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Handle unknown errors
  const statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = config.app.environment === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
      ...(config.app.environment !== 'production' && { stack: err.stack }),
    },
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};
```

### Step 4.5: Logger Middleware

**Create `src/middleware/logger.middleware.ts`:**

```typescript
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.util';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};
```

---

## 5. API Endpoints

### Step 5.0: Authentication API

**Create `src/api/validators/auth.validator.ts`:**

```typescript
import Joi from 'joi';
import { USER_ROLES } from '../../config/constants';

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
  displayName: Joi.string().min(2).max(100),
  role: Joi.string()
    .valid(...Object.values(USER_ROLES))
    .default(USER_ROLES.HOST),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
});
```

**Create `src/api/controllers/auth.controller.ts`:**

```typescript
import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../../config/firebase.config';
import { config } from '../../config/env.config';
import { COLLECTIONS, HTTP_STATUS, USER_ROLES } from '../../config/constants';
import { AppError } from '../../utils/error.util';
import { sendCreated, sendSuccess } from '../../utils/response.util';

const signInWithIdentityToolkit = async (email: string, password: string) => {
  if (!config.identityToolkitApiKey) {
    throw new AppError('Identity Toolkit API key missing', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${config.identityToolkitApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new AppError(
      payload.error?.message === 'INVALID_PASSWORD' ? 'Invalid email or password' : 'Unable to login user',
      payload.error?.message === 'INVALID_PASSWORD' ? HTTP_STATUS.UNAUTHORIZED : HTTP_STATUS.BAD_REQUEST
    );
  }

  return {
    idToken: payload.idToken,
    refreshToken: payload.refreshToken,
    expiresIn: Number(payload.expiresIn),
    localId: payload.localId,
  };
};

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, displayName, role } = req.body;
    const normalizedRole = role || USER_ROLES.HOST;

    const userRecord = await auth.createUser({ email, password, displayName });
    await auth.setCustomUserClaims(userRecord.uid, { role: normalizedRole });

    await db.collection(COLLECTIONS.USERS).doc(userRecord.uid).set({
      email,
      displayName: displayName || null,
      role: normalizedRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const tokens = await signInWithIdentityToolkit(email, password);

    sendCreated(res, {
      user: { uid: userRecord.uid, email, displayName, role: normalizedRole },
      tokens,
    }, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const tokens = await signInWithIdentityToolkit(email, password);
    const userRecord = await auth.getUser(tokens.localId);
    const role = (userRecord.customClaims?.role as string) || USER_ROLES.HOST;

    sendSuccess(res, {
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role,
      },
      tokens,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};
```

**Create `src/api/routes/auth.routes.ts`:**

```typescript
import { Router } from 'express';
import { validate } from '../../middleware/validation.middleware';
import { authLimiter } from '../../middleware/rateLimit.middleware';
import { loginSchema, signupSchema } from '../validators/auth.validator';
import { login, signUp } from '../controllers/auth.controller';

const router = Router();
router.use(authLimiter);

router.post('/signup', validate(signupSchema), signUp);
router.post('/login', validate(loginSchema), login);

export default router;
```

Mount the routes in `src/index.ts`:

```typescript
import authRoutes from './api/routes/auth.routes';
...
app.use('/api/v1/auth', authRoutes);
```

**Endpoints:**

- `POST /api/v1/auth/signup` – validates payload, creates Firebase user, sets custom role, and returns `{ user, tokens }`.
- `POST /api/v1/auth/login` – verifies credentials through Identity Toolkit and returns `{ user, tokens }`.

Both endpoints are rate-limited via `authLimiter`.

### Step 5.1: Events API

**Create `src/api/validators/events.validator.ts`:**

```typescript
import Joi from 'joi';
import { EVENT_TYPES, EVENT_STATUS } from '../../config/constants';

export const createEventSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(2000).allow(''),
  type: Joi.string().valid(...Object.values(EVENT_TYPES)).required(),
  date: Joi.date().iso().greater('now').required(),
  endDate: Joi.date().iso().greater(Joi.ref('date')).optional(),
  location: Joi.object({
    venue: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().required(),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180),
    }).optional(),
  }).required(),
  theme: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    colors: Joi.array().items(Joi.string()).min(1).required(),
    fontFamily: Joi.string().optional(),
    backgroundImage: Joi.string().uri().optional(),
  }).optional(),
  maxGuests: Joi.number().integer().min(1).optional(),
  isPublic: Joi.boolean().default(false),
  settings: Joi.object({
    allowPlusOnes: Joi.boolean().default(false),
    requireRSVP: Joi.boolean().default(true),
    enableGiftRegistry: Joi.boolean().default(true),
    enablePhotos: Joi.boolean().default(true),
    enableComments: Joi.boolean().default(true),
  }).default(),
});

export const updateEventSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  description: Joi.string().max(2000),
  date: Joi.date().iso().greater('now'),
  endDate: Joi.date().iso().greater(Joi.ref('date')),
  location: Joi.object({
    venue: Joi.string(),
    address: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    postalCode: Joi.string(),
  }),
  theme: Joi.object({
    id: Joi.string(),
    name: Joi.string(),
    colors: Joi.array().items(Joi.string()),
  }),
  status: Joi.string().valid(...Object.values(EVENT_STATUS)),
  maxGuests: Joi.number().integer().min(1),
  isPublic: Joi.boolean(),
  settings: Joi.object({
    allowPlusOnes: Joi.boolean(),
    requireRSVP: Joi.boolean(),
    enableGiftRegistry: Joi.boolean(),
    enablePhotos: Joi.boolean(),
    enableComments: Joi.boolean(),
  }),
}).min(1);

export const eventQuerySchema = Joi.object({
  status: Joi.string().valid(...Object.values(EVENT_STATUS)),
  type: Joi.string().valid(...Object.values(EVENT_TYPES)),
  limit: Joi.number().integer().min(1).max(100).default(10),
  page: Joi.number().integer().min(1).default(1),
  sortBy: Joi.string().valid('date', 'createdAt', 'title').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});
```

**Create `src/api/controllers/events.controller.ts`:**

```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { EventsService } from '../../services/events.service';
import { sendSuccess, sendCreated } from '../../utils/response.util';
import { AppError } from '../../utils/error.util';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';

const eventsService = new EventsService();

export class EventsController {
  /**
   * Create new event
   */
  async createEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      const event = await eventsService.createEvent(req.user.uid, req.body);
      sendCreated(res, event, 'Event created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's events
   */
  async getUserEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      const { status, type, limit, page, sortBy, sortOrder } = req.query;
      const events = await eventsService.getUserEvents(req.user.uid, {
        status: status as string,
        type: type as string,
        limit: Number(limit),
        page: Number(page),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      sendSuccess(res, events, 'Events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId } = req.params;
      const event = await eventsService.getEventById(eventId, req.user?.uid);

      sendSuccess(res, event, 'Event retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update event
   */
  async updateEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      const { eventId } = req.params;
      const event = await eventsService.updateEvent(eventId, req.user.uid, req.body);

      sendSuccess(res, event, 'Event updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      const { eventId } = req.params;
      await eventsService.deleteEvent(eventId, req.user.uid);

      sendSuccess(res, null, 'Event deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get event statistics
   */
  async getEventStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      const { eventId } = req.params;
      const stats = await eventsService.getEventStats(eventId, req.user.uid);

      sendSuccess(res, stats, 'Event statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
```

**Create `src/api/routes/events.routes.ts`:**

```typescript
import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate, validateQuery, validateParams } from '../../middleware/validation.middleware';
import {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
} from '../validators/events.validator';
import Joi from 'joi';

const router = Router();
const eventsController = new EventsController();

// All routes require authentication
router.use(authenticate);

// Create event
router.post(
  '/',
  validate(createEventSchema),
  eventsController.createEvent.bind(eventsController)
);

// Get user's events
router.get(
  '/',
  validateQuery(eventQuerySchema),
  eventsController.getUserEvents.bind(eventsController)
);

// Get event by ID
router.get(
  '/:eventId',
  validateParams(Joi.object({ eventId: Joi.string().required() })),
  eventsController.getEventById.bind(eventsController)
);

// Update event
router.put(
  '/:eventId',
  validateParams(Joi.object({ eventId: Joi.string().required() })),
  validate(updateEventSchema),
  eventsController.updateEvent.bind(eventsController)
);

// Delete event
router.delete(
  '/:eventId',
  validateParams(Joi.object({ eventId: Joi.string().required() })),
  eventsController.deleteEvent.bind(eventsController)
);

// Get event statistics
router.get(
  '/:eventId/stats',
  validateParams(Joi.object({ eventId: Joi.string().required() })),
  eventsController.getEventStats.bind(eventsController)
);

export default router;
```

---

## 6. Database Operations

### Step 6.1: Firestore Service

**Create `src/services/database/firestore.service.ts`:**

```typescript
import { db } from '../../config/firebase.config';
import {
  QuerySnapshot,
  DocumentData,
  WhereFilterOp,
  OrderByDirection,
  FieldValue,
} from 'firebase-admin/firestore';
import { AppError } from '../../utils/error.util';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';

export interface QueryOptions {
  where?: Array<{
    field: string;
    operator: WhereFilterOp;
    value: any;
  }>;
  orderBy?: Array<{
    field: string;
    direction: OrderByDirection;
  }>;
  limit?: number;
  offset?: number;
}

export class FirestoreService {
  /**
   * Get document by ID
   */
  async getDocument<T>(collection: string, docId: string): Promise<T | null> {
    try {
      const doc = await db.collection(collection).doc(docId).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as T;
    } catch (error: any) {
      throw new AppError(
        `Failed to get document: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Get multiple documents with query
   */
  async getDocuments<T>(
    collection: string,
    options: QueryOptions = {}
  ): Promise<T[]> {
    try {
      let query: FirebaseFirestore.Query = db.collection(collection);

      // Apply where clauses
      if (options.where) {
        options.where.forEach(({ field, operator, value }) => {
          query = query.where(field, operator, value);
        });
      }

      // Apply ordering
      if (options.orderBy) {
        options.orderBy.forEach(({ field, direction }) => {
          query = query.orderBy(field, direction);
        });
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Apply offset
      if (options.offset) {
        query = query.offset(options.offset);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error: any) {
      throw new AppError(
        `Failed to get documents: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Create document
   */
  async createDocument<T>(
    collection: string,
    data: Partial<T>,
    customId?: string
  ): Promise<string> {
    try {
      const timestamp = FieldValue.serverTimestamp();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      if (customId) {
        await db.collection(collection).doc(customId).set(docData);
        return customId;
      } else {
        const docRef = await db.collection(collection).add(docData);
        return docRef.id;
      }
    } catch (error: any) {
      throw new AppError(
        `Failed to create document: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Update document
   */
  async updateDocument(
    collection: string,
    docId: string,
    data: Partial<DocumentData>
  ): Promise<void> {
    try {
      await db
        .collection(collection)
        .doc(docId)
        .update({
          ...data,
          updatedAt: FieldValue.serverTimestamp(),
        });
    } catch (error: any) {
      if (error.code === 5) { // NOT_FOUND
        throw new AppError(
          'Document not found',
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }
      throw new AppError(
        `Failed to update document: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(collection: string, docId: string): Promise<void> {
    try {
      await db.collection(collection).doc(docId).delete();
    } catch (error: any) {
      throw new AppError(
        `Failed to delete document: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Batch write operations
   */
  async batchWrite(
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      collection: string;
      docId?: string;
      data?: any;
    }>
  ): Promise<void> {
    try {
      const batch = db.batch();
      const timestamp = FieldValue.serverTimestamp();

      operations.forEach(({ type, collection, docId, data }) => {
        if (type === 'create') {
          const ref = docId 
            ? db.collection(collection).doc(docId)
            : db.collection(collection).doc();
          batch.set(ref, {
            ...data,
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        } else if (type === 'update' && docId) {
          const ref = db.collection(collection).doc(docId);
          batch.update(ref, {
            ...data,
            updatedAt: timestamp,
          });
        } else if (type === 'delete' && docId) {
          const ref = db.collection(collection).doc(docId);
          batch.delete(ref);
        }
      });

      await batch.commit();
    } catch (error: any) {
      throw new AppError(
        `Failed to execute batch write: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Increment field value
   */
  async incrementField(
    collection: string,
    docId: string,
    field: string,
    value: number = 1
  ): Promise<void> {
    try {
      await db
        .collection(collection)
        .doc(docId)
        .update({
          [field]: FieldValue.increment(value),
          updatedAt: FieldValue.serverTimestamp(),
        });
    } catch (error: any) {
      throw new AppError(
        `Failed to increment field: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Get subcollection documents
   */
  async getSubcollection<T>(
    parentCollection: string,
    parentId: string,
    subcollection: string,
    options: QueryOptions = {}
  ): Promise<T[]> {
    try {
      let query: FirebaseFirestore.Query = db
        .collection(parentCollection)
        .doc(parentId)
        .collection(subcollection);

      if (options.where) {
        options.where.forEach(({ field, operator, value }) => {
          query = query.where(field, operator, value);
        });
      }

      if (options.orderBy) {
        options.orderBy.forEach(({ field, direction }) => {
          query = query.orderBy(field, direction);
        });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error: any) {
      throw new AppError(
        `Failed to get subcollection: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Create subcollection document
   */
  async createSubcollectionDocument<T>(
    parentCollection: string,
    parentId: string,
    subcollection: string,
    data: Partial<T>,
    customId?: string
  ): Promise<string> {
    try {
      const timestamp = FieldValue.serverTimestamp();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      if (customId) {
        await db
          .collection(parentCollection)
          .doc(parentId)
          .collection(subcollection)
          .doc(customId)
          .set(docData);
        return customId;
      } else {
        const docRef = await db
          .collection(parentCollection)
          .doc(parentId)
          .collection(subcollection)
          .add(docData);
        return docRef.id;
      }
    } catch (error: any) {
      throw new AppError(
        `Failed to create subcollection document: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }
}
```

### Step 6.2: Events Service

**Create `src/services/events.service.ts`:**

```typescript
import { FirestoreService } from './database/firestore.service';
import { COLLECTIONS, EVENT_STATUS } from '../config/constants';
import { AppError } from '../utils/error.util';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';
import { Event } from '../types/event.types';

export class EventsService {
  private firestoreService: FirestoreService;

  constructor() {
    this.firestoreService = new FirestoreService();
  }

  /**
   * Create new event
   */
  async createEvent(hostId: string, eventData: Partial<Event>): Promise<Event> {
    const event: Partial<Event> = {
      ...eventData,
      hostId,
      status: EVENT_STATUS.DRAFT,
      guestCount: 0,
    };

    const eventId = await this.firestoreService.createDocument<Event>(
      COLLECTIONS.EVENTS,
      event
    );

    const createdEvent = await this.firestoreService.getDocument<Event>(
      COLLECTIONS.EVENTS,
      eventId
    );

    if (!createdEvent) {
      throw new AppError(
        'Failed to retrieve created event',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }

    return createdEvent;
  }

  /**
   * Get user's events
   */
  async getUserEvents(
    userId: string,
    filters: {
      status?: string;
      type?: string;
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{
    events: Event[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      status,
      type,
      limit = 10,
      page = 1,
      sortBy = 'date',
      sortOrder = 'asc',
    } = filters;

    const where: any[] = [
      { field: 'hostId', operator: '==', value: userId },
    ];

    if (status) {
      where.push({ field: 'status', operator: '==', value: status });
    }

    if (type) {
      where.push({ field: 'type', operator: '==', value: type });
    }

    const events = await this.firestoreService.getDocuments<Event>(
      COLLECTIONS.EVENTS,
      {
        where,
        orderBy: [{ field: sortBy, direction: sortOrder }],
        limit: limit + 1, // Fetch one more to check if there are more pages
        offset: (page - 1) * limit,
      }
    );

    const hasMore = events.length > limit;
    const paginatedEvents = hasMore ? events.slice(0, limit) : events;

    return {
      events: paginatedEvents,
      total: paginatedEvents.length,
      page,
      limit,
    };
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string, userId?: string): Promise<Event> {
    const event = await this.firestoreService.getDocument<Event>(
      COLLECTIONS.EVENTS,
      eventId
    );

    if (!event) {
      throw new AppError(
        'Event not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    // Check access permissions
    if (!event.isPublic && userId && event.hostId !== userId) {
      // Check if user is a guest
      const guest = await this.firestoreService.getDocument(
        `${COLLECTIONS.EVENTS}/${eventId}/guests`,
        userId
      );

      if (!guest) {
        throw new AppError(
          'Access denied',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN
        );
      }
    }

    return event;
  }

  /**
   * Update event
   */
  async updateEvent(
    eventId: string,
    userId: string,
    updates: Partial<Event>
  ): Promise<Event> {
    // Verify ownership
    const event = await this.getEventById(eventId, userId);

    if (event.hostId !== userId) {
      throw new AppError(
        'Only event host can update the event',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    await this.firestoreService.updateDocument(
      COLLECTIONS.EVENTS,
      eventId,
      updates
    );

    const updatedEvent = await this.firestoreService.getDocument<Event>(
      COLLECTIONS.EVENTS,
      eventId
    );

    if (!updatedEvent) {
      throw new AppError(
        'Failed to retrieve updated event',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }

    return updatedEvent;
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string, userId: string): Promise<void> {
    const event = await this.getEventById(eventId, userId);

    if (event.hostId !== userId) {
      throw new AppError(
        'Only event host can delete the event',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    await this.firestoreService.deleteDocument(COLLECTIONS.EVENTS, eventId);
  }

  /**
   * Get event statistics
   */
  async getEventStats(eventId: string, userId: string): Promise<any> {
    const event = await this.getEventById(eventId, userId);

    if (event.hostId !== userId) {
      throw new AppError(
        'Access denied',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    // Get guests
    const guests = await this.firestoreService.getSubcollection(
      COLLECTIONS.EVENTS,
      eventId,
      'guests'
    );

    // Get gifts
    const gifts = await this.firestoreService.getSubcollection(
      COLLECTIONS.EVENTS,
      eventId,
      'gifts'
    );

    // Get memories
    const memories = await this.firestoreService.getSubcollection(
      COLLECTIONS.EVENTS,
      eventId,
      'memories'
    );

    const acceptedGuests = guests.filter((g: any) => g.rsvpStatus === 'accepted');
    const declinedGuests = guests.filter((g: any) => g.rsvpStatus === 'declined');
    const pendingGuests = guests.filter((g: any) => g.rsvpStatus === 'pending');

    const purchasedGifts = gifts.filter((g: any) => g.isPurchased);
    const totalGiftValue = gifts.reduce((sum: number, g: any) => sum + (g.price || 0), 0);

    return {
      guests: {
        total: guests.length,
        accepted: acceptedGuests.length,
        declined: declinedGuests.length,
        pending: pendingGuests.length,
      },
      gifts: {
        total: gifts.length,
        purchased: purchasedGifts.length,
        totalValue: totalGiftValue,
      },
      memories: {
        total: memories.length,
      },
    };
  }
}
```

---

## 7. AI Integration

**Create `src/services/ai/gemini.service.ts`:**

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../config/env.config';
import { AppError } from '../../utils/error.util';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import logger from '../../utils/logger.util';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!config.ai.geminiApiKey) {
      logger.warn('Gemini API key not configured');
    }
    
    this.genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Generate event theme suggestions
   */
  async generateEventTheme(
    eventType: string,
    preferences: string,
    budget?: number
  ): Promise<any> {
    try {
      const prompt = `Generate a creative and detailed event theme for a ${eventType}.

User Preferences: ${preferences}
${budget ? `Budget: $${budget}` : ''}

Please provide a JSON response with the following structure:
{
  "themeName": "string",
  "description": "string (2-3 sentences)",
  "colorPalette": ["hex color 1", "hex color 2", "hex color 3", "hex color 4", "hex color 5"],
  "decorationIdeas": [
    "decoration idea 1",
    "decoration idea 2",
    "decoration idea 3",
    "decoration idea 4",
    "decoration idea 5"
  ],
  "activities": [
    "activity 1",
    "activity 2",
    "activity 3"
  ],
  "mood": "string (description of the atmosphere)",
  "musicGenres": ["genre 1", "genre 2"],
  "dresscode": "string"
}

Ensure the response is valid JSON only, no additional text.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      logger.error('Gemini theme generation error:', error);
      throw new AppError(
        'Failed to generate theme',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Generate invitation caption
   */
  async generateInvitationCaption(eventDetails: {
    type: string;
    title: string;
    date: string;
    theme?: string;
  }): Promise<string> {
    try {
      const prompt = `Create a warm, engaging invitation caption for the following event:

Event Type: ${eventDetails.type}
Event Title: ${eventDetails.title}
Event Date: ${eventDetails.date}
${eventDetails.theme ? `Theme: ${eventDetails.theme}` : ''}

Generate a heartfelt, inviting message (2-3 sentences) that would make guests excited to attend. Make it personal and memorable.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error: any) {
      logger.error('Gemini caption generation error:', error);
      throw new AppError(
        'Failed to generate caption',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Suggest vendors based on event type
   */
  async suggestVendors(
    eventType: string,
    location: string,
    budget: number
  ): Promise<any[]> {
    try {
      const prompt = `Suggest the 5 most important vendor categories needed for a ${eventType} in ${location} with a budget of $${budget}.

For each vendor category, provide:
{
  "category": "string",
  "importance": "string (why they're important)",
  "estimatedBudget": number (suggested allocation),
  "keyQualities": ["quality 1", "quality 2", "quality 3"],
  "questions": ["question to ask vendor 1", "question to ask vendor 2"]
}

Return a JSON array of 5 vendor suggestions.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      logger.error('Gemini vendor suggestion error:', error);
      throw new AppError(
        'Failed to suggest vendors',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Generate memory caption for photo
   */
  async generateMemoryCaption(description: string): Promise<string> {
    try {
      const prompt = `Generate a heartfelt and creative caption for a photo from an event.

Photo Description: ${description}

Create a caption that's emotional, engaging, and suitable for social media sharing (1-2 sentences). Make it memorable.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error: any) {
      logger.error('Gemini memory caption error:', error);
      throw new AppError(
        'Failed to generate caption',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Generate event checklist
   */
  async generateEventChecklist(
    eventType: string,
    daysUntilEvent: number
  ): Promise<any> {
    try {
      const prompt = `Generate a comprehensive planning checklist for a ${eventType} that is ${daysUntilEvent} days away.

Organize tasks by time periods and provide specific, actionable items.

Return JSON with structure:
{
  "timePeriods": [
    {
      "period": "string (e.g., '3 months before')",
      "tasks": [
        {
          "task": "string",
          "priority": "high|medium|low",
          "category": "string"
        }
      ]
    }
  ]
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      logger.error('Gemini checklist generation error:', error);
      throw new AppError(
        'Failed to generate checklist',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }
}
```

**Create AI Controller and Routes** (abbreviated):

**`src/api/controllers/ai.controller.ts`:**

```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { GeminiService } from '../../services/ai/gemini.service';
import { sendSuccess } from '../../utils/response.util';
import { AppError } from '../../utils/error.util';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';

const geminiService = new GeminiService();

export class AIController {
  async generateTheme(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventType, preferences, budget } = req.body;
      const theme = await geminiService.generateEventTheme(eventType, preferences, budget);
      sendSuccess(res, theme, 'Theme generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async generateCaption(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const caption = await geminiService.generateInvitationCaption(req.body);
      sendSuccess(res, { caption }, 'Caption generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async suggestVendors(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventType, location, budget } = req.body;
      const vendors = await geminiService.suggestVendors(eventType, location, budget);
      sendSuccess(res, vendors, 'Vendors suggested successfully');
    } catch (error) {
      next(error);
    }
  }

  async generateChecklist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventType, daysUntilEvent } = req.body;
      const checklist = await geminiService.generateEventChecklist(eventType, daysUntilEvent);
      sendSuccess(res, checklist, 'Checklist generated successfully');
    } catch (error) {
      next(error);
    }
  }
}
```

**`src/api/routes/ai.routes.ts`:**

```typescript
import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { aiLimiter } from '../../middleware/rateLimit.middleware';
import Joi from 'joi';

const router = Router();
const aiController = new AIController();

// Apply authentication and AI rate limiting
router.use(authenticate);
router.use(aiLimiter);

// Generate theme
router.post(
  '/generate-theme',
  validate(
    Joi.object({
      eventType: Joi.string().required(),
      preferences: Joi.string().required(),
      budget: Joi.number().optional(),
    })
  ),
  aiController.generateTheme.bind(aiController)
);

// Generate caption
router.post(
  '/generate-caption',
  validate(
    Joi.object({
      type: Joi.string().required(),
      title: Joi.string().required(),
      date: Joi.string().required(),
      theme: Joi.string().optional(),
    })
  ),
  aiController.generateCaption.bind(aiController)
);

// Suggest vendors
router.post(
  '/suggest-vendors',
  validate(
    Joi.object({
      eventType: Joi.string().required(),
      location: Joi.string().required(),
      budget: Joi.number().required(),
    })
  ),
  aiController.suggestVendors.bind(aiController)
);

// Generate checklist
router.post(
  '/generate-checklist',
  validate(
    Joi.object({
      eventType: Joi.string().required(),
      daysUntilEvent: Joi.number().required(),
    })
  ),
  aiController.generateChecklist.bind(aiController)
);

export default router;
```

---

## 8. Payment Processing

**Create `src/services/payment/stripe.service.ts`:**

```typescript
import Stripe from 'stripe';
import config from '../../config/env.config';
import { AppError } from '../../utils/error.util';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import logger from '../../utils/logger.util';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!config.stripe.secretKey) {
      logger.warn('Stripe secret key not configured');
    }
    
    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Create payment intent for gift contribution
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error: any) {
      logger.error('Stripe payment intent creation error:', error);
      throw new AppError(
        'Failed to create payment intent',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Confirm payment
   */
  async confirmPayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      return paymentIntent;
    } catch (error: any) {
      logger.error('Stripe payment confirmation error:', error);
      throw new AppError(
        'Failed to confirm payment',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(
    paymentIntentId: string,
    amount?: number
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return refund;
    } catch (error: any) {
      logger.error('Stripe refund error:', error);
      throw new AppError(
        'Failed to process refund',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );
    } catch (error: any) {
      logger.error('Stripe webhook verification error:', error);
      throw new AppError(
        'Invalid webhook signature',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }
  }

  /**
   * Create customer
   */
  async createCustomer(
    email: string,
    name: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata,
      });

      return customer;
    } catch (error: any) {
      logger.error('Stripe customer creation error:', error);
      throw new AppError(
        'Failed to create customer',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(
        paymentMethodId,
        { customer: customerId }
      );

      return paymentMethod;
    } catch (error: any) {
      logger.error('Stripe payment method attachment error:', error);
      throw new AppError(
        'Failed to attach payment method',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }
}
```

---

## 9. Notification System

**Create `src/services/notification/email.service.ts`:**

```typescript
import sgMail from '@sendgrid/mail';
import config from '../../config/env.config';
import { AppError } from '../../utils/error.util';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import logger from '../../utils/logger.util';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

sgMail.setApiKey(config.sendgrid.apiKey);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  templateName: string;
  data: Record<string, any>;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

export class EmailService {
  private templatesPath: string;

  constructor() {
    this.templatesPath = path.join(__dirname, '../../templates/email');
  }

  /**
   * Send email using template
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const html = this.compileTemplate(options.templateName, options.data);

      const msg = {
        to: options.to,
        from: {
          email: config.sendgrid.fromEmail,
          name: config.sendgrid.fromName,
        },
        subject: options.subject,
        html,
        attachments: options.attachments,
      };

      await sgMail.send(msg);
      logger.info(`Email sent successfully to ${options.to}`);
    } catch (error: any) {
      logger.error('Email sending error:', error);
      throw new AppError(
        'Failed to send email',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Send event invitation email
   */
  async sendInvitation(
    recipientEmail: string,
    eventDetails: {
      eventName: string;
      hostName: string;
      date: string;
      location: string;
      invitationLink: string;
    }
  ): Promise<void> {
    await this.sendEmail({
      to: recipientEmail,
      subject: `You're invited to ${eventDetails.eventName}!`,
      templateName: 'invitation',
      data: eventDetails,
    });
  }

  /**
   * Send RSVP confirmation email
   */
  async sendRSVPConfirmation(
    recipientEmail: string,
    eventDetails: {
      eventName: string;
      date: string;
      location: string;
      rsvpStatus: string;
    }
  ): Promise<void> {
    await this.sendEmail({
      to: recipientEmail,
      subject: `RSVP Confirmed for ${eventDetails.eventName}`,
      templateName: 'rsvp-confirmation',
      data: eventDetails,
    });
  }

  /**
   * Send event reminder email
   */
  async sendEventReminder(
    recipientEmail: string,
    eventDetails: {
      eventName: string;
      date: string;
      location: string;
      daysUntil: number;
    }
  ): Promise<void> {
    await this.sendEmail({
      to: recipientEmail,
      subject: `Reminder: ${eventDetails.eventName} is coming up!`,
      templateName: 'event-reminder',
      data: eventDetails,
    });
  }

  /**
   * Send gift purchase confirmation
   */
  async sendGiftConfirmation(
    recipientEmail: string,
    giftDetails: {
      giftName: string;
      amount: number;
      eventName: string;
      receiptUrl: string;
    }
  ): Promise<void> {
    await this.sendEmail({
      to: recipientEmail,
      subject: `Gift Contribution Confirmed for ${giftDetails.eventName}`,
      templateName: 'gift-confirmation',
      data: giftDetails,
    });
  }

  /**
   * Compile Handlebars template
   */
  private compileTemplate(templateName: string, data: Record<string, any>): string {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const template = Handlebars.compile(templateSource);
      return template(data);
    } catch (error: any) {
      logger.error('Template compilation error:', error);
      throw new AppError(
        'Failed to compile email template',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }
  }
}
```

---

## 10. Utility Functions

**Create `src/utils/response.util.ts`:**

```typescript
import { Response } from 'express';
import { HTTP_STATUS } from '../config/constants';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message?: string
): void => {
  sendSuccess(res, data, message, HTTP_STATUS.CREATED);
};

export const sendNoContent = (res: Response): void => {
  res.status(HTTP_STATUS.NO_CONTENT).send();
};
```

**Create `src/utils/error.util.ts`:**

```typescript
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**Create `src/utils/logger.util.ts`:**

```typescript
import * as functions from 'firebase-functions';

class Logger {
  info(message: string, metadata?: any): void {
    functions.logger.info(message, metadata);
  }

  warn(message: string, metadata?: any): void {
    functions.logger.warn(message, metadata);
  }

  error(message: string, metadata?: any): void {
    functions.logger.error(message, metadata);
  }

  debug(message: string, metadata?: any): void {
    functions.logger.debug(message, metadata);
  }
}

export default new Logger();
```

---

## 11. Main Entry Point

**Create `src/index.ts`:**

```typescript
import * as functions from 'firebase-functions';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { corsOptions } from './config/cors.config';
import { validateConfig } from './config/env.config';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';

// Import routes
import eventsRoutes from './api/routes/events.routes';
import aiRoutes from './api/routes/ai.routes';
// Import other routes...

// Validate configuration
validateConfig();

// Create Express app
const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/ai', aiRoutes);
// Mount other routes...

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Export Express app as Firebase Function
export const api = functions
  .region('us-central1')
  .runWith({
    memory: '1GB',
    timeoutSeconds: 300,
  })
  .https.onRequest(app);

// Export Firestore triggers
export * from './triggers/firestore.triggers';

// Export scheduled functions
export * from './scheduled/reminders.scheduled';
```

---

## 12. Firebase Triggers

**Create `src/triggers/firestore.triggers.ts`:**

```typescript
import * as functions from 'firebase-functions';
import { db } from '../config/firebase.config';
import { EmailService } from '../services/notification/email.service';
import logger from '../utils/logger.util';

const emailService = new EmailService();

/**
 * Trigger when a new guest is added to an event
 */
export const onGuestCreated = functions.firestore
  .document('events/{eventId}/guests/{guestId}')
  .onCreate(async (snapshot, context) => {
    try {
      const guest = snapshot.data();
      const eventId = context.params.eventId;

      // Get event details
      const eventDoc = await db.collection('events').doc(eventId).get();
      const event = eventDoc.data();

      if (!event) {
        logger.error('Event not found', { eventId });
        return;
      }

      // Send invitation email
      await emailService.sendInvitation(guest.email, {
        eventName: event.title,
        hostName: event.hostName || 'Your host',
        date: event.date,
        location: event.location.venue,
        invitationLink: `https://wishbloom.com/invitations/${eventId}/${snapshot.id}`,
      });

      logger.info('Invitation sent successfully', {
        eventId,
        guestId: snapshot.id,
        email: guest.email,
      });
    } catch (error) {
      logger.error('Error in onGuestCreated trigger:', error);
    }
  });

/**
 * Trigger when a guest updates RSVP
 */
export const onRSVPUpdated = functions.firestore
  .document('events/{eventId}/guests/{guestId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();

      // Check if RSVP status changed
      if (before.rsvpStatus !== after.rsvpStatus) {
        const eventId = context.params.eventId;
        
        // Get event details
        const eventDoc = await db.collection('events').doc(eventId).get();
        const event = eventDoc.data();

        if (!event) return;

        // Update guest count
        const increment = after.rsvpStatus === 'accepted' ? 1 : 
                         before.rsvpStatus === 'accepted' ? -1 : 0;

        if (increment !== 0) {
          await db.collection('events').doc(eventId).update({
            guestCount: admin.firestore.FieldValue.increment(increment),
          });
        }

        // Send confirmation email
        await emailService.sendRSVPConfirmation(after.email, {
          eventName: event.title,
          date: event.date,
          location: event.location.venue,
          rsvpStatus: after.rsvpStatus,
        });

        logger.info('RSVP updated', {
          eventId,
          guestId: context.params.guestId,
          status: after.rsvpStatus,
        });
      }
    } catch (error) {
      logger.error('Error in onRSVPUpdated trigger:', error);
    }
  });

/**
 * Trigger when a gift is purchased
 */
export const onGiftPurchased = functions.firestore
  .document('events/{eventId}/gifts/{giftId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();

      // Check if gift was just purchased
      if (!before.isPurchased && after.isPurchased) {
        const eventId = context.params.eventId;
        
        // Get event details
        const eventDoc = await db.collection('events').doc(eventId).get();
        const event = eventDoc.data();

        if (!event) return;

        // Notify host
        const hostDoc = await db.collection('users').doc(event.hostId).get();
        const host = hostDoc.data();

        if (host && host.email) {
          // Send notification (implement this in email service)
          logger.info('Gift purchased notification', {
            eventId,
            giftId: context.params.giftId,
            hostEmail: host.email,
          });
        }
      }
    } catch (error) {
      logger.error('Error in onGiftPurchased trigger:', error);
    }
  });
```

---

## 13. Scheduled Tasks

**Create `src/scheduled/reminders.scheduled.ts`:**

```typescript
import * as functions from 'firebase-functions';
import { db } from '../config/firebase.config';
import { EmailService } from '../services/notification/email.service';
import logger from '../utils/logger.util';
import { addDays } from 'date-fns';

const emailService = new EmailService();

/**
 * Send event reminders - runs daily at 9 AM
 */
export const sendEventReminders = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      const now = new Date();
      const sevenDaysFromNow = addDays(now, 7);
      const oneDayFromNow = addDays(now, 1);

      // Find events happening in 7 days or 1 day
      const eventsSnapshot = await db
        .collection('events')
        .where('status', '==', 'published')
        .where('date', '>=', oneDayFromNow)
        .where('date', '<=', sevenDaysFromNow)
        .get();

      const promises = eventsSnapshot.docs.map(async (eventDoc) => {
        const event = eventDoc.data();
        const eventDate = event.date.toDate();
        const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Only send reminders at 7 days and 1 day before
        if (daysUntil !== 7 && daysUntil !== 1) return;

        // Get all guests who accepted
        const guestsSnapshot = await db
          .collection('events')
          .doc(eventDoc.id)
          .collection('guests')
          .where('rsvpStatus', '==', 'accepted')
          .get();

        // Send reminder to each guest
        const emailPromises = guestsSnapshot.docs.map((guestDoc) => {
          const guest = guestDoc.data();
          return emailService.sendEventReminder(guest.email, {
            eventName: event.title,
            date: event.date,
            location: event.location.venue,
            daysUntil,
          });
        });

        await Promise.all(emailPromises);
        logger.info(`Sent ${emailPromises.length} reminders for event ${eventDoc.id}`);
      });

      await Promise.all(promises);
      logger.info(`Event reminder job completed. Processed ${eventsSnapshot.size} events`);
    } catch (error) {
      logger.error('Error in sendEventReminders:', error);
    }
  });

/**
 * Clean up expired events - runs weekly on Sunday at 2 AM
 */
export const cleanupExpiredEvents = functions.pubsub
  .schedule('0 2 * * 0')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      const sixMonthsAgo = addDays(new Date(), -180);

      // Find completed events older than 6 months
      const eventsSnapshot = await db
        .collection('events')
        .where('status', '==', 'completed')
        .where('date', '<', sixMonthsAgo)
        .get();

      const batch = db.batch();
      
      eventsSnapshot.docs.forEach((doc) => {
        // Instead of deleting, archive the event
        batch.update(doc.ref, { archived: true });
      });

      await batch.commit();
      logger.info(`Archived ${eventsSnapshot.size} expired events`);
    } catch (error) {
      logger.error('Error in cleanupExpiredEvents:', error);
    }
  });
```

---

## 14. Deployment

### Step 14.1: Environment Configuration

```bash
# Set Firebase configuration
firebase functions:config:set \
  gemini.api_key="your_gemini_key" \
  stripe.secret_key="your_stripe_secret" \
  stripe.webhook_secret="your_webhook_secret" \
  sendgrid.api_key="your_sendgrid_key" \
  sendgrid.from_email="noreply@wishbloom.com" \
  identitytoolkit.api_key="your_web_api_key"

# View current configuration
firebase functions:config:get
```

### Step 14.2: Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:api

# Deploy with environment
firebase use production
firebase deploy --only functions
```

### Step 14.3: Test Functions Locally

```bash
# Start emulators
firebase emulators:start

# Test with emulator UI
# Open http://localhost:4000
```

---

## Summary

This Firebase Functions framework provides:

✅ **Complete REST API** with Express
✅ **Authentication & Authorization** middleware
✅ **Request Validation** with Joi
✅ **Rate Limiting** for API protection
✅ **AI Integration** with Gemini
✅ **Payment Processing** with Stripe
✅ **Email Notifications** with SendGrid
✅ **Firestore Triggers** for automation
✅ **Scheduled Tasks** for reminders
✅ **Error Handling** & logging
✅ **TypeScript** for type safety
✅ **Production-ready** structure

The framework is modular, scalable, and follows best practices for Firebase Cloud Functions!


