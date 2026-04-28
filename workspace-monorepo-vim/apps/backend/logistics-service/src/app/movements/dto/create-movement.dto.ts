import { IsUUID, IsNumber, Min, IsEnum, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '@logistics/prisma';
import { Type } from 'class-transformer';

export class CreateMovementDto {
  @ApiProperty({ description: 'ID do item (warehouse service)' })
  @IsUUID()
  item_id: string;

  @ApiPropertyOptional({ description: 'Local de origem (null se for entrada)' })
  @IsUUID()
  @IsOptional()
  from_location_id?: string;

  @ApiPropertyOptional({ description: 'Local de destino (null se for saída)' })
  @IsUUID()
  @IsOptional()
  to_location_id?: string;

  @ApiProperty({ description: 'Quantidade movimentada', example: 3 })
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ description: 'Tipo de movimentação', enum: MovementType })
  @IsEnum(MovementType)
  movement_type: MovementType;

  @ApiPropertyOptional({ description: 'Documento de referência (NF, OS, etc.)' })
  @IsString()
  @IsOptional()
  document_ref?: string;

  @ApiPropertyOptional({ description: 'Motivo (para ajustes/perdas)' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'Data/hora da ocorrência (padrão now)' })
  @IsDateString()
  @IsOptional()
  occurred_at?: string;
}