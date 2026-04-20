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
import { OrganizationPersonsService } from './organization-persons.service';
import { CreateOrganizationPersonDto } from './dto/create-organization-person.dto';
import { UpdateOrganizationPersonDto } from './dto/update-organization-person.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { organization_persons } from '@identity/prisma';

@ApiTags('organization-persons')
@Controller('organization-persons')
export class OrganizationPersonsController {
  constructor(private readonly service: OrganizationPersonsService) {}

  @Post()
  @ApiOperation({ summary: 'Vincular pessoa a organização' })
  @ApiResponse({ status: 201, description: 'Vínculo criado.' })
  async create(@Body() createDto: CreateOrganizationPersonDto): Promise<organization_persons> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar vínculos' })
  @ApiQuery({ name: 'organizationId', required: false })
  @ApiQuery({ name: 'personId', required: false })
  async findAll(
    @Query('organizationId') organizationId?: string,
    @Query('personId') personId?: string,
  ): Promise<organization_persons[]> {
    if (organizationId) {
      return this.service.findByOrganization(organizationId);
    }
    if (personId) {
      return this.service.findByPerson(personId);
    }
    return this.service.findAll();
  }

  @Get(':organizationId/:personId/:role')
  @ApiOperation({ summary: 'Buscar vínculo específico' })
  async findOne(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('personId', ParseUUIDPipe) personId: string,
    @Param('role') role: string,
  ): Promise<organization_persons> {
    return this.service.findOne(organizationId, personId, role);
  }

  @Patch(':organizationId/:personId/:role')
  @ApiOperation({ summary: 'Atualizar vínculo' })
  async update(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('personId', ParseUUIDPipe) personId: string,
    @Param('role') role: string,
    @Body() updateDto: UpdateOrganizationPersonDto,
  ): Promise<organization_persons> {
    return this.service.update(organizationId, personId, role, updateDto);
  }

  @Delete(':organizationId/:personId/:role')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover vínculo' })
  async remove(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('personId', ParseUUIDPipe) personId: string,
    @Param('role') role: string,
  ): Promise<void> {
    await this.service.remove(organizationId, personId, role);
  }
}