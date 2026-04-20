import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string) {
    const token = crypto.randomBytes(64).toString('hex');

    const expiraEm = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 7,
    );

    return this.prisma.refresh_token.create({
      data: {
        token,
        user: {
          connect: { id: userId }, // 👈 forma correta
        },
        expired_at: expiraEm,
        revoked_at: null,
      },
    });
  }

  async validate(token: string) {
    return this.prisma.refresh_token.findFirst({
      where: {
        token,
        revoked_at: null,
        expired_at: { gte: new Date() },
      },
    });
  }

  async revoke(token: string) {
    return this.prisma.refresh_token.updateMany({
      where: { token },
      data: { revoked_at: new Date() },
    });
  }

  async logout(sessionId: string) {
    return this.prisma.refresh_token.update({
      where: { id: sessionId },
      data: { revoked_at: new Date() },
    });
  }

  async logoutAll(userId: string) {
    return this.prisma.refresh_token.updateMany({
      where: { user_id: userId },
      data: { revoked_at: new Date() },
    });
  }
}