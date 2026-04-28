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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { categories } from '@warehouse/prisma';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova categoria' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(@Body() createDto: CreateCategoryDto): Promise<categories> {
    return this.categoriesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias' })
  @ApiResponse({ status: 200, description: 'Lista de categorias.' })
  async findAll(): Promise<categories[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiParam({ name: 'id', description: 'UUID da categoria' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada.' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<categories> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiParam({ name: 'id', description: 'UUID da categoria' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada.' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCategoryDto,
  ): Promise<categories> {
    return this.categoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover categoria (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID da categoria' })
  @ApiResponse({ status: 204, description: 'Categoria removida.' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.categoriesService.remove(id);
  }
}