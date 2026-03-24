import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../shared/utils/apiResponse';
import * as scheduleService from './schedules.service';

export const listSchedules = asyncHandler(async (req: Request, res: Response) => {
  const { schedules, pagination } = await scheduleService.list(req.query as any);
  sendPaginated(res, schedules, pagination);
});

export const getSchedule = asyncHandler(async (req: Request, res: Response) => {
  const schedule = await scheduleService.getById(req.params.id as string);
  sendSuccess(res, schedule);
});

export const createSchedule = asyncHandler(async (req: Request, res: Response) => {
  const { schedule, conflicts } = await scheduleService.create(req.body);
  sendCreated(res, { schedule, conflicts }, conflicts.hasConflict
    ? `Schedule created with ${conflicts.conflicts.length} overlap warning(s)`
    : 'Schedule created');
});

export const updateSchedule = asyncHandler(async (req: Request, res: Response) => {
  const { schedule, conflicts } = await scheduleService.update(req.params.id as string, req.body);
  sendSuccess(res, { schedule, conflicts }, 'Schedule updated');
});

export const deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
  await scheduleService.remove(req.params.id as string);
  sendNoContent(res);
});

export const getScreenSchedules = asyncHandler(async (req: Request, res: Response) => {
  const screenId = req.params.screenId as string;
  const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
  const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;
  const schedules = await scheduleService.getScreenSchedules(screenId, dateFrom, dateTo);
  sendSuccess(res, schedules);
});

export const getActiveSchedule = asyncHandler(async (req: Request, res: Response) => {
  const schedule = await scheduleService.getActiveSchedule(req.params.screenId as string);
  sendSuccess(res, schedule);
});

export const getScheduleCalendar = asyncHandler(async (req: Request, res: Response) => {
  const screenId = req.params.screenId as string;
  const month = Number(req.query.month);
  const year = Number(req.query.year);
  const calendar = await scheduleService.getScheduleCalendar(screenId, month, year);
  sendSuccess(res, calendar);
});
