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
import { BomService } from './bom.service';
import { CreateBomDto } from './dto/create-bom.dto';
import { UpdateBomDto } from './dto/update-bom.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { bom } from '@warehouse/prisma';

@ApiTags('bom')
@Controller('bom')
export class BomController {
  constructor(private readonly bomService: BomService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova relação BOM' })
  @ApiResponse({ status: 201, description: 'Relação criada.' })
  async create(@Body() createDto: CreateBomDto): Promise<bom> {
    return this.bomService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar relações BOM' })
  @ApiQuery({ name: 'parentItemId', required: false })
  @ApiQuery({ name: 'childItemId', required: false })
  async findAll(
    @Query('parentItemId') parentItemId?: string,
    @Query('childItemId') childItemId?: string,
  ): Promise<bom[]> {
    if (parentItemId) {
      return this.bomService.findByParent(parentItemId);
    }
    if (childItemId) {
      return this.bomService.findByChild(childItemId);
    }
    return this.bomService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar relação por ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<bom> {
    return this.bomService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar relação' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBomDto,
  ): Promise<bom> {
    return this.bomService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover relação (soft delete)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.bomService.remove(id);
  }
}