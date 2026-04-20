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
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { inventory } from '@logistics/prisma';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Criar ou atualizar estoque (upsert)' })
  @ApiResponse({ status: 201, description: 'Estoque atualizado.' })
  async upsert(@Body() createDto: CreateInventoryDto): Promise<inventory> {
    return this.inventoryService.upsert(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os estoques' })
  @ApiQuery({ name: 'itemId', required: false })
  async findAll(@Query('itemId') itemId?: string): Promise<inventory[]> {
    if (itemId) {
      return this.inventoryService.findByItem(itemId);
    }
    return this.inventoryService.findAll();
  }

  @Get(':locationId/:itemId')
  @ApiOperation({ summary: 'Buscar estoque por local e item' })
  @ApiParam({ name: 'locationId', description: 'UUID do local' })
  @ApiParam({ name: 'itemId', description: 'UUID do item' })
  async findOne(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<inventory> {
    return this.inventoryService.findOne(locationId, itemId);
  }

  @Patch(':locationId/:itemId')
  @ApiOperation({ summary: 'Atualizar estoque' })
  @ApiParam({ name: 'locationId', description: 'UUID do local' })
  @ApiParam({ name: 'itemId', description: 'UUID do item' })
  async update(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateDto: UpdateInventoryDto,
  ): Promise<inventory> {
    return this.inventoryService.update(locationId, itemId, updateDto);
  }

  @Delete(':locationId/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover estoque' })
  @ApiParam({ name: 'locationId', description: 'UUID do local' })
  @ApiParam({ name: 'itemId', description: 'UUID do item' })
  async remove(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<void> {
    await this.inventoryService.remove(locationId, itemId);
  }
}