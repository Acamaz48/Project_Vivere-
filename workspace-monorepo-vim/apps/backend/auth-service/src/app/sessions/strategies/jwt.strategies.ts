import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  cargo: string;
  sid: string; // session id
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: JwtPayload) {

    const session = await this.prisma.sessions.findUnique({
      where: { id: payload.sid },
    });

    if (!session)
      throw new UnauthorizedException('Sessão não encontrada');

    if (session.revoked_at)
      throw new UnauthorizedException('Sessão revogada');

    if (session.expired_at < new Date())
      throw new UnauthorizedException('Sessão expirada');

    // usuário disponível no request.user
    return {
      user_id: payload.sub,
      email: payload.email,
      session_id: payload.sid,
    };
  }
}