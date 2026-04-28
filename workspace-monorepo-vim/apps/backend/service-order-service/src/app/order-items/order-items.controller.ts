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
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { order_items } from '@service-order/prisma';

@ApiTags('order-items')
@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Adicionar item a uma ordem' })
  @ApiResponse({ status: 201, description: 'Item adicionado.' })
  async create(@Body() createDto: CreateOrderItemDto): Promise<order_items> {
    return this.orderItemsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar itens' })
  @ApiQuery({ name: 'orderId', required: false })
  async findAll(@Query('orderId') orderId?: string): Promise<order_items[]> {
    if (orderId) {
      return this.orderItemsService.findByOrder(orderId);
    }
    return this.orderItemsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar item por ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<order_items> {
    return this.orderItemsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar item' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateOrderItemDto,
  ): Promise<order_items> {
    return this.orderItemsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover item (soft delete)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.orderItemsService.remove(id);
  }
}