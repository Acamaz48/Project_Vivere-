import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { LoginHistoryService } from './login-history.service';
import { CreateLoginHistoryDto } from './dto/create-login-history.dto';
import { UpdateLoginHistoryDto } from './dto/update-login-history.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { login_history } from '@auth/prisma';

@ApiTags('login-history')
@Controller('login-history')
export class LoginHistoryController {
  constructor(private readonly loginHistoryService: LoginHistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar uma tentativa de login' })
  @ApiResponse({ status: 201, description: 'Registro criado.' })
  async create(@Body() createDto: CreateLoginHistoryDto): Promise<login_history> {
    return this.loginHistoryService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar histórico de login' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrar por usuário' })
  async findAll(@Query('userId') userId?: string): Promise<login_history[]> {
    if (userId) {
      return this.loginHistoryService.findByUser(userId);
    }
    return this.loginHistoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar registro por ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<login_history> {
    return this.loginHistoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar registro (raro)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateLoginHistoryDto,
  ): Promise<login_history> {
    return this.loginHistoryService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover registro' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.loginHistoryService.remove(id);
  }
}