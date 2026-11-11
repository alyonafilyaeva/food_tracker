import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { AppError } from '../../lib/errors';

const TOKEN_TTL = '30d';
const PASSWORD_SALT_ROUNDS = 12;

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export async function register(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, 'Пользователь с таким email уже существует');
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  return { token: signToken(user.id), user: { id: user.id, email: user.email } };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, 'Неверный email или пароль');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError(401, 'Неверный email или пароль');
  }

  return { token: signToken(user.id), user: { id: user.id, email: user.email } };
}

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'Пользователь не найден');
  }
  return { id: user.id, email: user.email };
}
