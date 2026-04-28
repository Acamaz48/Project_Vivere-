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
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { allocations } from '@logistics/prisma';

@ApiTags('allocations')
@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova reserva' })
  @ApiResponse({ status: 201, description: 'Reserva criada.' })
  async create(@Body() createDto: CreateAllocationDto): Promise<allocations> {
    return this.allocationsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar reservas' })
  @ApiQuery({ name: 'itemId', required: false })
  @ApiQuery({ name: 'locationId', required: false })
  async findAll(
    @Query('itemId') itemId?: string,
    @Query('locationId') locationId?: string,
  ): Promise<allocations[]> {
    if (itemId && locationId) {
      return this.allocationsService.findByItemAndLocation(itemId, locationId);
    }
    if (itemId) {
      return this.allocationsService.findByItem(itemId);
    }
    if (locationId) {
      return this.allocationsService.findByLocation(locationId);
    }
    return this.allocationsService.findAll();
  }

  @Get('check-availability')
  @ApiOperation({ summary: 'Verificar disponibilidade de um item em um período' })
  @ApiQuery({ name: 'itemId', required: true })
  @ApiQuery({ name: 'locationId', required: true })
  @ApiQuery({ name: 'start', required: true, description: 'Início do período (ISO)' })
  @ApiQuery({ name: 'end', required: true, description: 'Fim do período (ISO)' })
  async checkAvailability(
    @Query('itemId') itemId: string,
    @Query('locationId') locationId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<{ available: number; conflicts: any[] }> {
    return this.allocationsService.checkAvailability(itemId, locationId, new Date(start), new Date(end));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar reserva por ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<allocations> {
    return this.allocationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar reserva' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAllocationDto,
  ): Promise<allocations> {
    return this.allocationsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar reserva' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.allocationsService.remove(id);
  }
}