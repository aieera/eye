import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import prisma from '../../config/database';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { AppError } from '../../shared/utils/apiError';
import * as screensService from './screens.service';
import * as schedulesService from '../schedules/schedules.service';
import * as playlistsService from '../playlists/playlists.service';

export const deviceController = {
  async register(req: Request, res: Response) {
    const { screenCode } = req.body;
    const screen = await prisma.screen.findUnique({ where: { screenCode } });
    if (!screen || !screen.isActive) throw AppError.notFound('Invalid screen code');

    const deviceJwt = jwt.sign(
      { sub: screen.id, screenId: screen.id, type: 'device' },
      config.JWT_SECRET,
      { expiresIn: '30d' }
    );

    sendSuccess(res, {
      token: deviceJwt,
      screenId: screen.id,
      screenName: screen.screenName,
      locationId: screen.locationId,
    }, 'Device registered successfully');
  },

  async heartbeat(req: Request, res: Response) {
    const screenId = req.screen!.id;
    await screensService.heartbeat(screenId, req.body);
    sendSuccess(res, null, 'Heartbeat recorded');
  },

  async getActivePlaylist(req: Request, res: Response) {
    const screenId = req.screen!.id;
    const locationId = req.screen!.locationId;

    const activeSchedule = await schedulesService.getActiveSchedule(screenId);

    if (!activeSchedule) {
      return sendSuccess(res, { playlist: null, schedule: null }, 'No active schedule');
    }

    const playlist = await playlistsService.getPlaylistForScreen(
      activeSchedule.playlistId,
      locationId
    );

    sendSuccess(res, {
      playlist,
      schedule: {
        id: activeSchedule.id,
        startTime: activeSchedule.startTime,
        endTime: activeSchedule.endTime,
        recurrenceType: activeSchedule.recurrenceType,
      },
    });
  },

  async getTodaySchedule(req: Request, res: Response) {
    const screenId = req.screen!.id;
    const today = new Date();
    const schedules = await schedulesService.getScreenSchedules(screenId, today, today);
    sendSuccess(res, schedules);
  },

  async submitLog(req: Request, res: Response) {
    const screenId = req.screen!.id;
    const { eventType, payload } = req.body;

    await prisma.screenLog.create({
      data: {
        screenId,
        eventType: eventType || 'device_log',
        payload: payload || {},
        ipAddress: req.ip || req.socket?.remoteAddress || null,
      },
    });

    sendSuccess(res, null, 'Log recorded');
  },
};
