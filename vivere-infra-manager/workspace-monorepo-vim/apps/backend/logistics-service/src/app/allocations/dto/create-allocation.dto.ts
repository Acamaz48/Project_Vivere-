import { IsUUID, IsNumber, Min, IsDateString, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAllocationDto {
  @ApiProperty({ description: 'ID do item (warehouse service)' })
  @IsUUID()
  @IsNotEmpty()
  item_id: string;

  @ApiProperty({ description: 'ID do local' })
  @IsUUID()
  @IsNotEmpty()
  location_id: string;

  @ApiProperty({ description: 'Quantidade reservada', example: 5 })
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ description: 'Início do período (ISO)', example: '2025-06-01T08:00:00Z' })
  @IsDateString()
  period_start: string;

  @ApiProperty({ description: 'Fim do período (ISO)', example: '2025-06-05T18:00:00Z' })
  @IsDateString()
  period_end: string;

  @ApiPropertyOptional({ description: 'Status da reserva', default: 'RESERVED' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'UUID do responsável pela reserva' })
  @IsUUID()
  @IsNotEmpty()
  created_by: string; 
}