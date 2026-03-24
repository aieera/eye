import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../shared/utils/apiError';
import { logger } from '../shared/utils/logger';
import { config } from '../config';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // AppError (our custom errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Zod validation errors (v4 uses .issues)
  if (err?.name === 'ZodError' && Array.isArray(err.issues)) {
    const formatted = err.issues.map((e: any) => ({
      field: e.path?.join('.') || '',
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formatted,
    });
  }

  // JSON SyntaxError from body-parser — return 400, not 500
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
    });
  }

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const rawTarget = err.meta?.target;
      const target = Array.isArray(rawTarget)
        ? rawTarget.join(', ')
        : typeof rawTarget === 'string'
        ? rawTarget
        : 'field';
      return res.status(409).json({
        success: false,
        message: `A record with this ${target} already exists`,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }
  }

  // Unknown error
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
  });

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
