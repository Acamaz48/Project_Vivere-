import {
  Controller,
  Post,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';

import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  /* LOGOUT sessão atual */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: any) {
    const sid = req.user?.sessionId;

    if (!sid)
      throw new BadRequestException('session id não encontrado');

    return this.sessionsService.logout(sid);
  }

  /* LOGOUT TODAS sessões */
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  logoutAll(@Req() req: any) {
    const userId = req.user?.userId;

    if (!userId)
      throw new BadRequestException('user id não encontrado');

    return this.sessionsService.logoutAll(userId);
  }
}