import {Router} from "express";
import * as giftsController from "../controllers/gifts.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validate, validateParams} from "../../middleware/validation.middleware";
import {createGiftSchema, updateGiftSchema, giftStatusSchema} from "../validators/gifts.validator";
import {eventParamsSchema, giftParamsSchema} from "../validators/common.validator";

const router = Router();

router.get(
  "/:eventId/gifts",
  authenticate,
  validateParams(eventParamsSchema),
  giftsController.listGifts
);

router.post(
  "/:eventId/gifts",
  authenticate,
  validateParams(eventParamsSchema),
  validate(createGiftSchema),
  giftsController.addGift
);

router.put(
  "/:eventId/gifts/:giftId",
  authenticate,
  validateParams(giftParamsSchema),
  validate(updateGiftSchema),
  giftsController.updateGift
);

router.patch(
  "/:eventId/gifts/:giftId/status",
  authenticate,
  validateParams(giftParamsSchema),
  validate(giftStatusSchema),
  giftsController.updateGiftStatus
);

router.delete(
  "/:eventId/gifts/:giftId",
  authenticate,
  validateParams(giftParamsSchema),
  giftsController.removeGift
);

export default router;
