import {Router} from "express";
import * as albumsController from "../controllers/albums.controller";
import {authenticate} from "../../middleware/auth.middleware";
import {validateParams} from "../../middleware/validation.middleware";
import {eventParamsSchema} from "../validators/common.validator";
import {ensureGuestOrHost} from "../../middlewares/ensureGuestOrHost";

const router = Router();

router.use("/:eventId/albums", authenticate, validateParams(eventParamsSchema), ensureGuestOrHost);

router.post("/:eventId/albums", albumsController.createAlbum);
router.get("/:eventId/albums", albumsController.listAlbums);
router.get("/:eventId/albums/:albumId", albumsController.getAlbum);
router.put("/:eventId/albums/:albumId", albumsController.updateAlbum);
router.delete("/:eventId/albums/:albumId", albumsController.deleteAlbum);

export default router;
