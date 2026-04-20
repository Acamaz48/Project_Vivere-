import { IsUUID, IsNumber, Min, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInventoryDto {
  @ApiProperty({ description: 'ID do local' })
  @IsUUID()
  location_id: string;

  @ApiProperty({ description: 'ID do item (warehouse service)' })
  @IsUUID()
  item_id: string;

  @ApiProperty({ description: 'Quantidade em estoque', example: 10.5 })
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({ description: 'Data da última contagem' })
  @IsDateString()
  @IsOptional()
  last_count_at?: string;

  @ApiPropertyOptional({ description: 'UUID do operador que atualizou' })
  @IsUUID()
  @IsOptional()
  updated_by?: string;
}