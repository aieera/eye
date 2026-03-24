import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../config/database';
import { AppError } from '../shared/utils/apiError';

declare global {
  namespace Express {
    interface Request {
      screen?: {
        id: string;
        screenName: string;
        screenCode: string;
        locationId: string;
      };
    }
  }
}

export const requireDeviceAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = (req.headers['x-device-token'] as string) || req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw AppError.unauthorized('Device token required');

    let decoded: { sub: string; type?: string };
    try {
      decoded = jwt.verify(token, config.JWT_SECRET) as { sub: string; type?: string };
    } catch {
      throw AppError.unauthorized('Invalid or expired device token');
    }
    if (!decoded.sub) throw AppError.unauthorized('Invalid device token');

    const screen = await prisma.screen.findUnique({
      where: { id: decoded.sub },
      select: { id: true, screenName: true, screenCode: true, locationId: true, isActive: true },
    });

    if (!screen || !screen.isActive) throw AppError.unauthorized('Screen not found or inactive');

    req.screen = {
      id: screen.id,
      screenName: screen.screenName,
      screenCode: screen.screenCode,
      locationId: screen.locationId,
    };
    next();
  } catch (error) {
    next(error);
  }
};
