import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../shared/utils/apiResponse';
import * as screenService from './screens.service';

export const listScreens = asyncHandler(async (req: Request, res: Response) => {
  const { screens, pagination } = await screenService.list(req.query as any);
  sendPaginated(res, screens, pagination);
});

export const getScreenStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await screenService.getStats();
  sendSuccess(res, stats);
});

export const getScreen = asyncHandler(async (req: Request, res: Response) => {
  const screen = await screenService.getById(req.params.id as string);
  sendSuccess(res, screen);
});

export const createScreen = asyncHandler(async (req: Request, res: Response) => {
  const screen = await screenService.create(req.body);
  sendCreated(res, screen, 'Screen created successfully. Save the device secret — it cannot be retrieved later.');
});

export const updateScreen = asyncHandler(async (req: Request, res: Response) => {
  const screen = await screenService.update(req.params.id as string, req.body);
  sendSuccess(res, screen, 'Screen updated successfully');
});

export const deleteScreen = asyncHandler(async (req: Request, res: Response) => {
  await screenService.remove(req.params.id as string);
  sendNoContent(res);
});

export const registerDevice = asyncHandler(async (req: Request, res: Response) => {
  const result = await screenService.registerDevice(req.body.screenCode);
  sendSuccess(res, result);
});

export const heartbeatHandler = asyncHandler(async (req: Request, res: Response) => {
  // For now use screenId from query or a header; later Phase 3 switches to deviceAuth
  const screenId = req.params.screenId as string;
  await screenService.heartbeat(screenId, req.body);
  sendSuccess(res, null, 'Heartbeat recorded');
});
