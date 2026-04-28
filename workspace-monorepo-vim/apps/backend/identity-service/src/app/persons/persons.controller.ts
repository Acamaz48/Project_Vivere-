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
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { persons } from '@identity/prisma';

@ApiTags('persons')
@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova pessoa física' })
  @ApiResponse({ status: 201, description: 'Pessoa criada com sucesso.' })
  async create(@Body() createDto: CreatePersonDto): Promise<persons> {
    return this.personsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as pessoas' })
  async findAll(): Promise<persons[]> {
    return this.personsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pessoa por ID' })
  @ApiParam({ name: 'id', description: 'UUID da pessoa' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<persons> {
    return this.personsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pessoa' })
  @ApiParam({ name: 'id', description: 'UUID da pessoa' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePersonDto,
  ): Promise<persons> {
    return this.personsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover pessoa (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID da pessoa' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.personsService.remove(id);
  }
}