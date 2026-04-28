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
  Query,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { locations } from '@logistics/prisma';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo local' })
  @ApiResponse({ status: 201, description: 'Local criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(@Body() createDto: CreateLocationDto): Promise<locations> {
    return this.locationsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os locais' })
  @ApiQuery({ name: 'type', required: false, enum: ['WAREHOUSE', 'EVENT', 'VEHICLE'] })
  @ApiQuery({ name: 'orderId', required: false })
  async findAll(
    @Query('type') type?: string,
    @Query('orderId') orderId?: string,
  ): Promise<locations[]> {
    if (orderId) {
      return this.locationsService.findByOrder(orderId);
    }
    if (type) {
      return this.locationsService.findByType(type);
    }
    return this.locationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar local por ID' })
  @ApiParam({ name: 'id', description: 'UUID do local' })
  @ApiResponse({ status: 200, description: 'Local encontrado.' })
  @ApiResponse({ status: 404, description: 'Local não encontrado.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<locations> {
    return this.locationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar local' })
  @ApiParam({ name: 'id', description: 'UUID do local' })
  @ApiResponse({ status: 200, description: 'Local atualizado.' })
  @ApiResponse({ status: 404, description: 'Local não encontrado.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateLocationDto,
  ): Promise<locations> {
    return this.locationsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover local (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID do local' })
  @ApiResponse({ status: 204, description: 'Local removido.' })
  @ApiResponse({ status: 404, description: 'Local não encontrado.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.locationsService.remove(id);
  }
}