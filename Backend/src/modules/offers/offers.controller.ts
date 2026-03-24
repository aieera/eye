import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../shared/utils/apiResponse';
import * as offerService from './offers.service';

export const listOffers = asyncHandler(async (req: Request, res: Response) => {
  const { offers, pagination } = await offerService.list(req.query as any);
  sendPaginated(res, offers, pagination);
});

export const getActiveOffers = asyncHandler(async (req: Request, res: Response) => {
  const locationId = typeof req.query.locationId === 'string' ? req.query.locationId : undefined;
  const offers = await offerService.getActiveOffers(locationId);
  sendSuccess(res, offers);
});

export const getOffer = asyncHandler(async (req: Request, res: Response) => {
  const offer = await offerService.getById(req.params.id as string);
  sendSuccess(res, offer);
});

export const createOffer = asyncHandler(async (req: Request, res: Response) => {
  const offer = await offerService.create(req.body);
  sendCreated(res, offer);
});

export const updateOffer = asyncHandler(async (req: Request, res: Response) => {
  const offer = await offerService.update(req.params.id as string, req.body);
  sendSuccess(res, offer, 'Offer updated successfully');
});

export const deleteOffer = asyncHandler(async (req: Request, res: Response) => {
  await offerService.remove(req.params.id as string);
  sendNoContent(res);
});
