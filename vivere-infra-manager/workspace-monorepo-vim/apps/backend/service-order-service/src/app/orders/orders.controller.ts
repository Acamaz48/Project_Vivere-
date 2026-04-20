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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { orders } from '@service-order/prisma';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova ordem de serviço' })
  @ApiResponse({ status: 201, description: 'Ordem criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 409, description: 'Código já existe.' })
  async create(@Body() createDto: CreateOrderDto): Promise<orders> {
    return this.ordersService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as ordens de serviço' })
  @ApiQuery({ name: 'customerId', required: false, description: 'Filtrar por cliente' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por status' })
  async findAll(
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ): Promise<orders[]> {
    return this.ordersService.findAll(customerId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ordem por ID' })
  @ApiParam({ name: 'id', description: 'UUID da ordem' })
  @ApiResponse({ status: 200, description: 'Ordem encontrada.' })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<orders> {
    return this.ordersService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Buscar ordem por código' })
  @ApiParam({ name: 'code', description: 'Código da ordem' })
  @ApiResponse({ status: 200, description: 'Ordem encontrada.' })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada.' })
  async findByCode(@Param('code') code: string): Promise<orders> {
    return this.ordersService.findByCode(code);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar ordem' })
  @ApiParam({ name: 'id', description: 'UUID da ordem' })
  @ApiResponse({ status: 200, description: 'Ordem atualizada.' })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateOrderDto,
  ): Promise<orders> {
    return this.ordersService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover ordem (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID da ordem' })
  @ApiResponse({ status: 204, description: 'Ordem removida.' })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.ordersService.remove(id);
  }
}