import {Request, Response, NextFunction} from "express";
import {GuestsService} from "../../services/guests.service";
import {EventsService} from "../../services/events.service";
import {sendCreated} from "../../utils/response.util";
import {AppError} from "../../utils/error.util";
import {HTTP_STATUS} from "../../config/constants";

const ensureEventOwnership = async (req: Request, eventId: string) => {
  if (!req.user) {
    throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
  }

  const event = await EventsService.getEventById(eventId);
  if (event.hostId !== req.user.uid) {
    throw new AppError("Unauthorized to import contacts for this event", HTTP_STATUS.FORBIDDEN);
  }

  return event;
};

// Import contacts as guests for an event, mainly to send invitations later
export const importContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {eventId, guests} = req.body;
    await ensureEventOwnership(req, eventId);

    const createdGuests = await GuestsService.addGuestsBulk(eventId, guests || []);
    sendCreated(res, createdGuests, "Contacts imported as guests successfully");
  } catch (error) {
    next(error);
  }
};
