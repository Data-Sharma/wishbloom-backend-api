import {Router} from "express";
import {authenticate} from "../../middleware/auth.middleware";
import {validate} from "../../middleware/validation.middleware";
import {importContacts} from "../controllers/contacts.controller";
import {importContactsSchema} from "../validators/guests.validator";

const router = Router();

// POST /api/contacts/import
// Imports contacts as guests for a specific event (for invitations)
router.post(
  "/contacts/import",
  authenticate,
  validate(importContactsSchema),
  importContacts
);

export default router;
