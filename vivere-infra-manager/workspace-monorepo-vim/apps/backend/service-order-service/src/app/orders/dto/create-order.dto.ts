import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsNumber, Min, IsDateString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerType, OrderStatus } from '@service-order/prisma';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({ description: 'Código da ordem de serviço', example: 'OS-2025-001' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Tipo de cliente', enum: CustomerType })
  @IsEnum(CustomerType)
  customer_type: CustomerType;

  @ApiProperty({ description: 'ID do cliente (organização ou pessoa)' })
  @IsUUID()
  customer_id: string;

  @ApiPropertyOptional({ description: 'Status da OS', enum: OrderStatus, default: 'DRAFT' })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Valor total da OS', example: 1500.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  total_value?: number;

  @ApiPropertyOptional({ description: 'Moeda', example: 'BRL', default: 'BRL' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Observações gerais' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Nome do evento' })
  @IsString()
  @IsOptional()
  event_name?: string;

  @ApiPropertyOptional({ description: 'Local do evento' })
  @IsString()
  @IsOptional()
  event_location?: string;

  @ApiPropertyOptional({ description: 'Início do evento' })
  @IsDateString()
  @IsOptional()
  event_start?: string;

  @ApiPropertyOptional({ description: 'Fim do evento' })
  @IsDateString()
  @IsOptional()
  event_end?: string;

  @ApiPropertyOptional({ description: 'Início da montagem' })
  @IsDateString()
  @IsOptional()
  assembly_start?: string;

  @ApiPropertyOptional({ description: 'Prazo de entrega da montagem' })
  @IsDateString()
  @IsOptional()
  assembly_deadline?: string;

  @ApiPropertyOptional({ description: 'Início da desmontagem' })
  @IsDateString()
  @IsOptional()
  disassembly_start?: string;

  @ApiPropertyOptional({ description: 'Nome do responsável no local' })
  @IsString()
  @IsOptional()
  onsite_responsible_name?: string;

  @ApiPropertyOptional({ description: 'Observações de montagem' })
  @IsString()
  @IsOptional()
  notes_montagem?: string;

  @ApiProperty({ description: 'UUID do criador (usuário)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  created_by: string;
}