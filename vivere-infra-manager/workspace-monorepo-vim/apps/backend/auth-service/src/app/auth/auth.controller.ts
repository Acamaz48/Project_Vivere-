import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { SessionsService } from '../sessions/sessions.service';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionsService: SessionsService,
  ) {}

  /* ================= LOGIN ================= */
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
  ) {
    return this.authService.login(
      body.email,
      body.password,
    );
  }

  /* ================= REFRESH ================= */
  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    const session =
      await this.sessionsService.validate(
        body.refreshToken,
      );

    if (!session) {
      throw new Error('Refresh token inválido');
    }

    return {
      message: 'Refresh válido',
      session,
    };
  }

  /* ================= LOGOUT ================= */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      await this.sessionsService.revoke(token);
    }

    return { message: 'Logout realizado' };
  }
}