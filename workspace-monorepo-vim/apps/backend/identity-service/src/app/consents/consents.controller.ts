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
import { ConsentsService } from './consents.service';
import { CreateConsentDto } from './dto/create-consent.dto';
import { UpdateConsentDto } from './dto/update-consent.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { consents } from '@identity/prisma';

@ApiTags('consents')
@Controller('consents')
export class ConsentsController {
  constructor(private readonly consentsService: ConsentsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar consentimento' })
  @ApiResponse({ status: 201, description: 'Consentimento registrado.' })
  async create(@Body() createDto: CreateConsentDto): Promise<consents> {
    return this.consentsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar consentimentos' })
  @ApiQuery({ name: 'personId', required: false })
  async findAll(@Query('personId') personId?: string): Promise<consents[]> {
    if (personId) {
      return this.consentsService.findByPerson(personId);
    }
    return this.consentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar consentimento por ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<consents> {
    return this.consentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar consentimento' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateConsentDto,
  ): Promise<consents> {
    return this.consentsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover consentimento' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.consentsService.remove(id);
  }
}