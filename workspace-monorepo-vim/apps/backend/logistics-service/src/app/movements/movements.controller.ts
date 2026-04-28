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
import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { movements } from '@logistics/prisma';

@ApiTags('movements')
@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar uma movimentação' })
  @ApiResponse({ status: 201, description: 'Movimentação registrada.' })
  async create(@Body() createDto: CreateMovementDto): Promise<movements> {
    return this.movementsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar movimentações' })
  @ApiQuery({ name: 'itemId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async findAll(
    @Query('itemId') itemId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<movements[]> {
    if (startDate && endDate) {
      return this.movementsService.findByPeriod(new Date(startDate), new Date(endDate));
    }
    if (itemId) {
      return this.movementsService.findByItem(itemId);
    }
    return this.movementsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar movimentação por ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<movements> {
    return this.movementsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar movimentação (raro)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateMovementDto,
  ): Promise<movements> {
    return this.movementsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover movimentação' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.movementsService.remove(id);
  }
}