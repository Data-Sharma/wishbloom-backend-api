import {Request, Response, NextFunction} from "express";
import {AlbumsService} from "../../services/albums.service";
import {sendCreated, sendSuccess, sendNoContent} from "../../utils/response.util";

export const createAlbum = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    const album = await AlbumsService.createAlbum(eventId, req.body);
    sendCreated(res, album, "Album created");
  } catch (error) {
    next(error);
  }
};

export const listAlbums = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId} = req.params;
    const albums = await AlbumsService.listAlbums(eventId);
    sendSuccess(res, albums);
  } catch (error) {
    next(error);
  }
};

export const getAlbum = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId, albumId} = req.params;
    const album = await AlbumsService.getAlbum(eventId, albumId);
    sendSuccess(res, album);
  } catch (error) {
    next(error);
  }
};

export const updateAlbum = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId, albumId} = req.params;
    await AlbumsService.updateAlbum(eventId, albumId, req.body);
    const album = await AlbumsService.getAlbum(eventId, albumId);
    sendSuccess(res, album, "Album updated");
  } catch (error) {
    next(error);
  }
};

export const deleteAlbum = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {eventId, albumId} = req.params;
    await AlbumsService.deleteAlbum(eventId, albumId);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};
