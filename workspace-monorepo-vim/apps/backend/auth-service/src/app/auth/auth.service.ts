import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../common/password';
import { SessionsService } from '../sessions/sessions.service';
import { LoginHistoryService } from '../login-history/login-history.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';


import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
    private sessionsService: SessionsService,
    private loginHistoryService: LoginHistoryService,
  ) {}

  /* ================= LOGIN ================= */
  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email e senha obrigatórios');
    }

    const usuario = await this.prisma.user.findUnique({
      where: { email },
    });

    // ❌ usuário não encontrado
    if (!usuario) {
      await this.loginHistoryService.logFailure('UNKNOWN', email);
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    // ❌ usuário inativo
    if (!usuario.is_active) {
      throw new ForbiddenException('Conta não ativa');
    }

    // 🔐 valida senha
    const senhaValida = await this.passwordService.verify(
      password,
      usuario.password_hash,
    );

    if (!senhaValida) {
      await this.loginHistoryService.logFailure(usuario.id, email);
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    // 🔁 cria sessão (refresh token)
    const session = await this.sessionsService.create(usuario.id);

    // 🔐 access token
    const accessToken = this.jwtService.sign({
      sub: usuario.id,
      email: usuario.email,
      sid: session.id,
    });

    // 📊 auditoria
    await this.loginHistoryService.logSuccess(usuario.id);

    return {
      accessToken,
      refreshToken: session.token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
      },
    };
  }

  /* ================= REGISTER ================= */
  async register(data: {
    email: string;
    password: string;
    person_id: string;
  }) {
    const { email, password, person_id } = data;

    if (!email || !password || !person_id) {
      throw new BadRequestException('Dados obrigatórios');
    }

    // 🔍 verifica duplicidade
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    // 🔐 hash da senha
    const password_hash = await this.passwordService.hash(password);

    // 👤 cria usuário (SEM mexer no identity)
    const user = await this.prisma.user.create({
      data: {
        email,
        password_hash,
        person_id,
        is_active: true,
        requires_mfa: false,
      },
    });

    return {
      id: user.id,
      email: user.email,
    };
  }
}