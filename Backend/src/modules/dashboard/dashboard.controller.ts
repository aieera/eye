import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import * as dashboardService from './dashboard.service';

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await dashboardService.getDashboardStats();
  sendSuccess(res, stats);
});

export const getActivity = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 15;
  const activity = await dashboardService.getRecentActivity(limit);
  sendSuccess(res, activity);
});
