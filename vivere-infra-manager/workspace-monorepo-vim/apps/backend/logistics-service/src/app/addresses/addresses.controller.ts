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
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { addresses } from '@logistics/prisma';

@ApiTags('addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo endereço' })
  @ApiResponse({ status: 201, description: 'Endereço criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(@Body() createDto: CreateAddressDto): Promise<addresses> {
    return this.addressesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os endereços' })
  @ApiResponse({ status: 200, description: 'Lista de endereços.' })
  async findAll(): Promise<addresses[]> {
    return this.addressesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar endereço por ID' })
  @ApiParam({ name: 'id', description: 'UUID do endereço' })
  @ApiResponse({ status: 200, description: 'Endereço encontrado.' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<addresses> {
    return this.addressesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar endereço' })
  @ApiParam({ name: 'id', description: 'UUID do endereço' })
  @ApiResponse({ status: 200, description: 'Endereço atualizado.' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAddressDto,
  ): Promise<addresses> {
    return this.addressesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover endereço (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID do endereço' })
  @ApiResponse({ status: 204, description: 'Endereço removido.' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.addressesService.remove(id);
  }
}