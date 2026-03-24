import { Request, Response } from 'express';
import { config } from '../../config';
import { asyncHandler } from '../../middleware/asyncHandler';
import { sendSuccess, sendCreated, sendNoContent } from '../../shared/utils/apiResponse';
import * as authService from './auth.service';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false as boolean,
  sameSite: 'strict' as const,
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  const cookieOpts = {
    ...REFRESH_COOKIE_OPTIONS,
    secure: config.NODE_ENV === 'production',
  };

  res.cookie('refreshToken', result.refreshToken, cookieOpts);

  sendSuccess(res, {
    user: result.user,
    accessToken: result.accessToken,
  }, 'Login successful');
});

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  sendCreated(res, user, 'User registered successfully');
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return sendSuccess(res, null, 'No refresh token', 401);
  }

  const result = await authService.refreshToken(token);
  sendSuccess(res, result, 'Token refreshed');
});

export const getMeHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  sendSuccess(res, user);
});

export const changePasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  await authService.changePassword(req.user!.id, req.body);
  sendSuccess(res, null, 'Password changed successfully');
});

export const logoutHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  sendSuccess(res, null, 'Logged out successfully');
});
