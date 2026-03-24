import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../shared/utils/apiResponse';
import * as locationService from './locations.service';

export const listLocations = asyncHandler(async (req: Request, res: Response) => {
  const { locations, pagination } = await locationService.list(req.query as any);
  sendPaginated(res, locations, pagination);
});

export const getLocation = asyncHandler(async (req: Request, res: Response) => {
  const location = await locationService.getById(req.params.id as string);
  sendSuccess(res, location);
});

export const createLocation = asyncHandler(async (req: Request, res: Response) => {
  const location = await locationService.create(req.body);
  sendCreated(res, location);
});

export const updateLocation = asyncHandler(async (req: Request, res: Response) => {
  const location = await locationService.update(req.params.id as string, req.body);
  sendSuccess(res, location, 'Location updated successfully');
});

export const deleteLocation = asyncHandler(async (req: Request, res: Response) => {
  await locationService.remove(req.params.id as string);
  sendNoContent(res);
});
