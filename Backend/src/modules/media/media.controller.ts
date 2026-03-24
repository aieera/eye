import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import * as mediaService from './media.service';

export const assignImage = asyncHandler(async (req: Request, res: Response) => {
  const { entityType, entityId, url } = req.body;
  const result = await mediaService.assignImage(entityType, entityId, url);
  sendSuccess(res, result, 'Image assigned successfully');
});

export const removeImage = asyncHandler(async (req: Request, res: Response) => {
  const entityType = req.params.entityType as string;
  const entityId = req.params.entityId as string;
  const result = await mediaService.removeEntityImage(entityType, entityId);
  sendSuccess(res, result, 'Image removed successfully');
});
