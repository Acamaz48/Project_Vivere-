import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { roles } from '@auth/prisma';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo perfil' })
  @ApiResponse({ status: 201, description: 'Perfil criado.' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<roles> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os perfis' })
  async findAll(): Promise<roles[]> {
    return this.rolesService.findAll();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Buscar perfil por código' })
  async findOne(@Param('code') code: string): Promise<roles> {
    return this.rolesService.findOne(code);
  }

  @Patch(':code')
  @ApiOperation({ summary: 'Atualizar perfil' })
  async update(
    @Param('code') code: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<roles> {
    return this.rolesService.update(code, updateRoleDto);
  }

  @Delete(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover perfil' })
  async remove(@Param('code') code: string): Promise<void> {
    await this.rolesService.remove(code);
  }
}