import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../shared/utils/apiResponse';
import * as playlistService from './playlists.service';
import { emitPlaylistPublish } from '../websocket/socket';

export const listPlaylists = asyncHandler(async (req: Request, res: Response) => {
  const { playlists, pagination } = await playlistService.list(req.query as any);
  sendPaginated(res, playlists, pagination);
});

export const getPlaylist = asyncHandler(async (req: Request, res: Response) => {
  const playlist = await playlistService.getById(req.params.id as string);
  sendSuccess(res, playlist);
});

export const createPlaylist = asyncHandler(async (req: Request, res: Response) => {
  const playlist = await playlistService.create(req.body, req.user!.id);
  sendCreated(res, playlist);
});

export const updatePlaylist = asyncHandler(async (req: Request, res: Response) => {
  const playlist = await playlistService.update(req.params.id as string, req.body);
  sendSuccess(res, playlist, 'Playlist updated successfully');
});

export const deletePlaylist = asyncHandler(async (req: Request, res: Response) => {
  await playlistService.remove(req.params.id as string);
  sendNoContent(res);
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await playlistService.addItem(req.params.id as string, req.body);
  sendCreated(res, item);
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await playlistService.updateItem(
    req.params.id as string,
    req.params.itemId as string,
    req.body
  );
  sendSuccess(res, item, 'Item updated');
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  await playlistService.removeItem(req.params.id as string, req.params.itemId as string);
  sendNoContent(res);
});

export const reorderItems = asyncHandler(async (req: Request, res: Response) => {
  const items = await playlistService.reorderItems(req.params.id as string, req.body);
  sendSuccess(res, items, 'Items reordered');
});

export const publishPlaylist = asyncHandler(async (req: Request, res: Response) => {
  const { playlist, affectedScreenIds } = await playlistService.publish(req.params.id as string);

  if (affectedScreenIds.length > 0) {
    try {
      const playlistForScreens = await playlistService.getPlaylistForScreen(
        playlist.id,
        playlist.locationId || ''
      );
      emitPlaylistPublish(affectedScreenIds, playlistForScreens);
    } catch {
      // Socket emit failure shouldn't block publish response
    }
  }

  sendSuccess(res, {
    playlist,
    affectedScreens: affectedScreenIds.length,
  }, `Playlist published (v${playlist.version}). ${affectedScreenIds.length} screen(s) notified.`);
});

export const duplicatePlaylist = asyncHandler(async (req: Request, res: Response) => {
  const copy = await playlistService.duplicate(req.params.id as string, req.user!.id);
  sendCreated(res, copy, 'Playlist duplicated');
});
