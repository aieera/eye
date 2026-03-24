import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { config } from '../../config';
import { AppError } from '../../shared/utils/apiError';
import { createSystemLog } from '../logs/logs.service';
import type { LoginInput, RegisterInput, ChangePasswordInput } from './auth.schema';
import type { SafeUser, AuthTokens } from './auth.types';

const SALT_ROUNDS = 12;

const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

function generateTokens(userId: string, email: string, role: string): AuthTokens {
  const accessToken = jwt.sign(
    { sub: userId, email, role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN as any }
  );

  const refreshToken = jwt.sign(
    { sub: userId, email, role },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN as any }
  );

  return { accessToken, refreshToken };
}

export async function login(input: LoginInput) {
  const user = await prisma.adminUser.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw AppError.unauthorized('Invalid credentials');
  }

  if (!user.isActive) {
    throw AppError.unauthorized('Account is inactive');
  }

  const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatch) {
    throw AppError.unauthorized('Invalid credentials');
  }

  const tokens = generateTokens(user.id, user.email, user.role);

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  createSystemLog('info', 'auth', 'login', `User ${user.email} logged in`, undefined, user.id);

  const { passwordHash: _, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

export async function register(input: RegisterInput): Promise<SafeUser> {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.adminUser.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      role: input.role || 'admin',
    },
    select: safeUserSelect,
  });

  return user;
}

export async function refreshToken(token: string): Promise<{ accessToken: string }> {
  let decoded: { sub: string; email: string; role: string };
  try {
    decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as typeof decoded;
  } catch {
    throw AppError.unauthorized('Invalid refresh token');
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: decoded.sub },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw AppError.unauthorized('User not found or inactive');
  }

  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN as any }
  );

  return { accessToken };
}

export async function getMe(userId: string): Promise<SafeUser> {
  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: safeUserSelect,
  });

  if (!user) {
    throw AppError.notFound('User not found');
  }

  return user;
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw AppError.notFound('User not found');
  }

  const passwordMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!passwordMatch) {
    throw AppError.badRequest('Current password is incorrect');
  }

  const newHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

  await prisma.adminUser.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  createSystemLog('info', 'auth', 'change_password', `User changed their password`, undefined, userId);
}
