import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { organizations } from '@identity/prisma';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova organização' })
  @ApiResponse({ status: 201, description: 'Organização criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 409, description: 'CNPJ já existe.' })
  async create(@Body() createDto: CreateOrganizationDto): Promise<organizations> {
    return this.organizationsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as organizações' })
  @ApiResponse({ status: 200, description: 'Lista de organizações.' })
  async findAll(): Promise<organizations[]> {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar organização por ID' })
  @ApiParam({ name: 'id', description: 'UUID da organização' })
  @ApiResponse({ status: 200, description: 'Organização encontrada.' })
  @ApiResponse({ status: 404, description: 'Organização não encontrada.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<organizations> {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar organização' })
  @ApiParam({ name: 'id', description: 'UUID da organização' })
  @ApiResponse({ status: 200, description: 'Organização atualizada.' })
  @ApiResponse({ status: 404, description: 'Organização não encontrada.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateOrganizationDto,
  ): Promise<organizations> {
    return this.organizationsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover organização (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID da organização' })
  @ApiResponse({ status: 204, description: 'Organização removida.' })
  @ApiResponse({ status: 404, description: 'Organização não encontrada.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.organizationsService.remove(id);
  }
}