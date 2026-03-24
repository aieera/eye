import { Response } from 'express';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function sendSuccess(res: Response, data: any, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

export function sendCreated(res: Response, data: any, message = 'Created successfully') {
  return res.status(201).json({
    success: true,
    data,
    message,
  });
}

export function sendPaginated(res: Response, data: any, pagination: PaginationMeta, message = 'Success') {
  return res.status(200).json({
    success: true,
    data,
    message,
    meta: { pagination },
  });
}

export function sendNoContent(res: Response) {
  return res.status(204).send();
}
