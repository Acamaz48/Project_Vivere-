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
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { user_roles } from '@auth/prisma';

@ApiTags('user-roles')
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @ApiOperation({ summary: 'Atribuir um perfil a um usuário' })
  @ApiResponse({ status: 201, description: 'Perfil atribuído.' })
  async create(@Body() createDto: CreateUserRoleDto): Promise<user_roles> {
    return this.userRolesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as atribuições' })
  async findAll(): Promise<user_roles[]> {
    return this.userRolesService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar perfis de um usuário' })
  async findByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<user_roles[]> {
    return this.userRolesService.findByUser(userId);
  }

  @Get(':userId/:roleCode')
  @ApiOperation({ summary: 'Buscar uma atribuição específica' })
  async findOne(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleCode') roleCode: string,
  ): Promise<user_roles> {
    return this.userRolesService.findOne(userId, roleCode);
  }

  @Patch(':userId/:roleCode')
  @ApiOperation({ summary: 'Atualizar uma atribuição' })
  async update(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleCode') roleCode: string,
    @Body() updateDto: UpdateUserRoleDto,
  ): Promise<user_roles> {
    return this.userRolesService.update(userId, roleCode, updateDto);
  }

  @Delete(':userId/:roleCode')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover uma atribuição' })
  async remove(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleCode') roleCode: string,
  ): Promise<void> {
    await this.userRolesService.remove(userId, roleCode);
  }
}