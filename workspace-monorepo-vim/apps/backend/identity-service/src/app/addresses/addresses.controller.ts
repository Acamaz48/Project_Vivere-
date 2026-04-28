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
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { addresses } from '@identity/prisma';

@ApiTags('addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo endereço' })
  @ApiResponse({ status: 201, description: 'Endereço criado.' })
  async create(@Body() createDto: CreateAddressDto): Promise<addresses> {
    return this.addressesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar endereços' })
  @ApiQuery({ name: 'organizationId', required: false })
  @ApiQuery({ name: 'personId', required: false })
  async findAll(
    @Query('organizationId') organizationId?: string,
    @Query('personId') personId?: string,
  ): Promise<addresses[]> {
    if (organizationId) {
      return this.addressesService.findByOrganization(organizationId);
    }
    if (personId) {
      return this.addressesService.findByPerson(personId);
    }
    return this.addressesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar endereço por ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<addresses> {
    return this.addressesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar endereço' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAddressDto,
  ): Promise<addresses> {
    return this.addressesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover endereço (soft delete)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.addressesService.remove(id);
  }
}