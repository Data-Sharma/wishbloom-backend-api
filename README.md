# WishBloom Backend

Serverless backend for the WishBloom event-planning platform built on Firebase Functions with a TypeScript + Express stack.

## Prerequisites

- Node.js 22+
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Firestore, Auth, Storage enabled

## Install & Run

```bash
cd functions
npm install
npm run build          # transpile TypeScript to lib/
npm run serve          # run Firebase emulators (builds first)
npm test               # execute Jest suite
```

## Configuration

Set required runtime config / environment variables before deploying or running emulators:

```bash
firebase functions:config:set \
  identitytoolkit.api_key="YOUR_FIREBASE_WEB_API_KEY" \
  gemini.api_key="YOUR_GEMINI_API_KEY" \
  stripe.secret_key="YOUR_STRIPE_SECRET_KEY" \
  stripe.webhook_secret="YOUR_STRIPE_WEBHOOK_SECRET" \
  sendgrid.api_key="YOUR_SENDGRID_API_KEY" \
  sendgrid.from_email="noreply@wishbloom.com" \
  sendgrid.from_name="WishBloom" \
  twilio.account_sid="YOUR_TWILIO_SID" \
  twilio.auth_token="YOUR_TWILIO_TOKEN" \
  twilio.phone_number="+10000000000"
```

You can also use environment variables (`FIREBASE_WEB_API_KEY`, `GEMINI_API_KEY`, etc.) when running locally.

## Project Structure

```
functions/
  src/
    api/            # Express routes/controllers/validators
    config/         # env + firebase setup, constants, CORS
    middleware/     # auth, validation, logging, rate limit, errors
    services/       # Firestore DAL, domain logic, AI, payments, notifications
    scheduled/      # Pub/Sub cron jobs
    triggers/       # Firestore/Auth/Storage background handlers
    templates/      # Handlebars email templates
    types/          # Shared TypeScript interfaces
    utils/          # Logger, AppError, response helpers, crypto, dates
  tests/            # Jest setup + unit tests
  package.json      # scripts + dependencies
  tsconfig.json     # TypeScript compiler config
```

## Deployment

```bash
cd functions
npm run build
firebase deploy --only functions
```

The `firebase.json` predeploy hook runs the build automatically, but running it manually helps catch issues earlier.

## Coding Standards

- Keep compiled output (`functions/lib/`) out of version control (already gitignored).
- Use `logger` utilities instead of `console.log`.
- Throw `AppError` for predictable HTTP responses.
- Validate all inputs with the Joi schemas in `api/validators`.
- Prefer services for data access/business logic; controllers should stay thin.


