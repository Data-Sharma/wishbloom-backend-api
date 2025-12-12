import Joi from "joi";
import {RSVP_STATUS} from "../../config/constants";

export const submitRsvpSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(RSVP_STATUS))
    .required(),
  message: Joi.string().max(500).optional(),
});
