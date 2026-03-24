import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import {
  createPlaylistSchema, updatePlaylistSchema, listPlaylistsSchema,
  addPlaylistItemSchema, updatePlaylistItemSchema, reorderItemsSchema,
} from './playlists.schema';
import * as playlistController from './playlists.controller';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listPlaylistsSchema, 'query'), playlistController.listPlaylists);
router.get('/:id', playlistController.getPlaylist);
router.post('/', validate(createPlaylistSchema, 'body'), playlistController.createPlaylist);
router.put('/:id', validate(updatePlaylistSchema, 'body'), playlistController.updatePlaylist);
router.delete('/:id', playlistController.deletePlaylist);

// Items
router.post('/:id/items', validate(addPlaylistItemSchema, 'body'), playlistController.addItem);
// reorder MUST come before /:itemId to avoid "reorder" being matched as an item ID
router.put('/:id/items/reorder', validate(reorderItemsSchema, 'body'), playlistController.reorderItems);
router.put('/:id/items/:itemId', validate(updatePlaylistItemSchema, 'body'), playlistController.updateItem);
router.delete('/:id/items/:itemId', playlistController.removeItem);

// Publish & Duplicate
router.post('/:id/publish', playlistController.publishPlaylist);
router.post('/:id/duplicate', playlistController.duplicatePlaylist);

export default router;
