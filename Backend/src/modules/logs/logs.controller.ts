import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse';
import * as logsService from './logs.service';

export const getScreenLogs = asyncHandler(async (req: Request, res: Response) => {
  const { logs, pagination } = await logsService.getScreenLogs(req.query as any);
  sendPaginated(res, logs, pagination);
});

export const getSystemLogs = asyncHandler(async (req: Request, res: Response) => {
  const { logs, pagination } = await logsService.getSystemLogs(req.query as any);
  sendPaginated(res, logs, pagination);
});

export const getIngestionLogs = asyncHandler(async (req: Request, res: Response) => {
  const { logs, pagination } = await logsService.getIngestionLogs(req.query as any);
  sendPaginated(res, logs, pagination);
});

export const getLogStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await logsService.getLogStats();
  sendSuccess(res, stats);
});
