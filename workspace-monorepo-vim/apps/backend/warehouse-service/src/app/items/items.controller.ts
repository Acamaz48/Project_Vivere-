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
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { items } from '@warehouse/prisma';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo item' })
  @ApiResponse({ status: 201, description: 'Item criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 409, description: 'SKU já existe.' })
  async create(@Body() createDto: CreateItemDto): Promise<items> {
    return this.itemsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os itens' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('active') active?: string,
  ): Promise<items[]> {
    return this.itemsService.findAll(categoryId, active);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar item por ID' })
  @ApiParam({ name: 'id', description: 'UUID do item' })
  @ApiResponse({ status: 200, description: 'Item encontrado.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<items> {
    return this.itemsService.findOne(id);
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: 'Buscar item por SKU' })
  @ApiParam({ name: 'sku', description: 'SKU do item' })
  @ApiResponse({ status: 200, description: 'Item encontrado.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  async findBySku(@Param('sku') sku: string): Promise<items> {
    return this.itemsService.findBySku(sku);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar item' })
  @ApiParam({ name: 'id', description: 'UUID do item' })
  @ApiResponse({ status: 200, description: 'Item atualizado.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateItemDto,
  ): Promise<items> {
    return this.itemsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover item (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID do item' })
  @ApiResponse({ status: 204, description: 'Item removido.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.itemsService.remove(id);
  }
}